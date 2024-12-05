import { diskStorage } from "multer";
import { join } from "path";

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(__dirname, "..", "..", "..", "upload");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  }),
};
