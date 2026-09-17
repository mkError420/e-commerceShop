import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "frontend/src/data/mockProducts.ts");
const content = fs.readFileSync(filePath, "utf8");
const matches = content.match(/https:\/\/images\.unsplash\.com[^"']+/g) || [];
const unique = Array.from(new Set(matches));
console.log("Total unique Unsplash image URLs:", unique.length);
console.log("Sample URLs:", unique.slice(0, 3));
