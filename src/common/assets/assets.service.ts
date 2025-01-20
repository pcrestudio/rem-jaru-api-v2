import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AssetsService {
  private uploadDir = "./uploads/assets/";

  constructor() {}

  async uploadFont(file: Express.Multer.File, userId: number) {
    const dir = path.join(this.uploadDir, "fonts");
    this.ensureDirExistence(dir);
    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer); // Saving the file locally
    return { fileUrl: `/assets/fonts/${file.originalname}` };
  }

  async uploadLogo(file: Express.Multer.File, userId: number) {
    const dir = path.join(this.uploadDir, "logos");
    this.ensureDirExistence(dir);
    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    return { fileUrl: `/assets/logos/${file.originalname}` };
  }

  async uploadBackgroundImage(file: Express.Multer.File, userId: number) {
    const dir = path.join(this.uploadDir, "backgrounds");
    this.ensureDirExistence(dir);
    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    return { fileUrl: `/assets/backgrounds/${file.originalname}` };
  }

  private ensureDirExistence(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
