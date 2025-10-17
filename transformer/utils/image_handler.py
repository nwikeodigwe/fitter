from transformers import DPTForDepthEstimation, DPTImageProcessor
from cloudinary.utils import cloudinary_url
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional
import cloudinary.uploader
from flask import request
from io import BytesIO
from PIL import Image
import numpy as np
import cloudinary
import requests
import logging
import torch
import uuid
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "TripoSR")))
from TripoSR import tsr

load_dotenv()

logger = logging.getLogger('flask_app')

cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
    api_key = os.getenv("CLOUDINARY_API_KEY"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

midas = DPTForDepthEstimation.from_pretrained('Intel/dpt-swinv2-large-384')
processor = DPTImageProcessor.from_pretrained("Intel/dpt-swinv2-large-384")


class ImageHandler:
    def __init__(self, urls: list[str], transformId: str):
        self.urls = urls
        self.depth_maps = []
        self.reference_size: Optional[tuple[int, int]] = None
        self.transformId = transformId

    def get(self):
        images = []
        for url in self.urls:
            print(url)
            try:
                response = requests.get(url, timeout=10)
                if response.status_code != 200:
                    return None
                image = Image.open(BytesIO(response.content)).convert('RGB')
                images.append(image)
            except Exception as e:
                logger.info("An error occurred while trying to get image")
                raise ValueError("An error occured while trying to get image")
        return images

    def transform(self, images):
        depth_maps = []
        reference_size = None

        for i, image in enumerate(images):
            logger.info(f"Processing image {i+1}/{len(images)}")
            inputs = processor(images=image, return_tensors="pt")

            with torch.no_grad():
                outputs = midas(**inputs)
                depth_map = outputs.predicted_depth.squeeze().cpu().numpy()

            if reference_size is None:
                reference_size = depth_map.shape
            elif depth_map.shape != reference_size:
                from scipy.ndimage import zoom
                scale_y = reference_size[0] / depth_map.shape[0]
                scale_x = reference_size[1] / depth_map.shape[1]
                depth_map = zoom(depth_map, (scale_y, scale_x), order=1)

            depth_maps.append(depth_map)

        combined_depth = np.mean(depth_maps, axis=0)

        eps = 1e-8
        normalized = (combined_depth - combined_depth.min()) / (combined_depth.max() - combined_depth.min() + eps)

        threshold = 0.2  
        cleaned = np.where(normalized < threshold, 0.5, normalized)
        depth_image = Image.fromarray((cleaned * 255).astype(np.uint8))

        return depth_image

    def upload(self, image):
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        try:
            upload_result = cloudinary.uploader.upload(img_byte_arr,
                public_id=f'depth_map_{uuid.uuid4().hex}',
                folder='depth_maps',
                resource_type='image',
                format='png')
            depth_url = upload_result["secure_url"]
            logger.info(f"Uploading image {depth_url}")
            requests.patch(f'{os.getenv("EXPRESS_URI")}/item/{self.transformId}', json={ "depthMap": depth_url })

            return depth_url
        except Exception as e:
            logger.info(f"An error occurred while trying to upload image {e}")
            raise ValueError(f"An error occured while trying to get image  {e}") 

    def transform_and_upload(self, images):
       transform = self.transform(images)
       depth_url = self.upload(transform)
       return depth_url
    
    def generate_glb(self):
        logger.info(tsr)
        return
