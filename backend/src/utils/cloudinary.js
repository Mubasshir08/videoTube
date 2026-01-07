 import {v2 as cloudinary} from 'cloudinary';

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
      return response;

   } catch (error) {
      fs.unlinkSync(localFilePath); // remove the file saved on the server if upload is failed
      throw error;
   }
}
 export {uploadOnClodinary};