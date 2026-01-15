 import {v2 as cloudinary} from 'cloudinary';
 import fs from 'fs';

 // config clodinary
 cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
    secure : true
 });

const uploadOnClodinary = async (localFilePath) => {
   try {
      if(!localFilePath) return null;
      const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
      console.log("file uploaded on clodinary successfully !\n", response.url);
      fs.unlinkSync(localFilePath);
      return response;

   } catch (error) {
      fs.unlinkSync(localFilePath); // remove the file saved on the server if upload is failed
      throw error;
   }
};

const deleteOnClodinary = async (clodinaryUrl) => {
   try {
      if(!clodinaryUrl) return null;
      const response = await cloudinary.uploader.destroy(clodinaryUrl);
      console.log("file deleted on clodinary successfully !\n", response);
      return response;
   } catch (error) {
      throw error;
   }
};

 export {uploadOnClodinary, deleteOnClodinary};