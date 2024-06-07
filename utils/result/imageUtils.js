import fs from "fs";
import axios from "axios";
import { Buffer } from "buffer";

export async function getImageBase64(imageUrl) {
  if (imageUrl.startsWith("http")) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary").toString("base64");
  } else {
    const fileData = fs.readFileSync(imageUrl);
    return Buffer.from(fileData).toString("base64");
  }
}
