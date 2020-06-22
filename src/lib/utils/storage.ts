import { diskStorage } from "multer"

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const multerStorage = diskStorage({
    destination: './public/images',
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.');
        const extension = fileName[fileName.length - 1];
        const oldFileNameModified = fileName[0].length > 10 ? fileName[0].substr(0, 10) : fileName[0];
        const newFileName = Array(16)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

        cb(null, `${oldFileNameModified}-${newFileName}.${extension}`)
    }
})