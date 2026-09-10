import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "melatrace-local-secret-change-me";
const db = new Database(path.join(process.cwd(), "melatrace.db"));
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

db.exec(`
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS materials(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  farmer TEXT,
  harvest_date TEXT,
  status TEXT NOT NULL DEFAULT 'Đang hoạt động',
  notes TEXT
);
CREATE TABLE IF NOT EXISTS production_batches(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  material_code TEXT NOT NULL,
  production_date TEXT,
  facility TEXT,
  status TEXT NOT NULL DEFAULT 'Hoàn tất',
  notes TEXT
);
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  production_batch_code TEXT NOT NULL,
  manufacture_date TEXT,
  expiry_date TEXT,
  image_url TEXT,
  warning TEXT,
  ingredients_json TEXT NOT NULL DEFAULT '[]',
  certificates_json TEXT NOT NULL DEFAULT '[]',
  references_json TEXT NOT NULL DEFAULT '["Dược điển Việt Nam VI"]',
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS tests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  product_code TEXT NOT NULL UNIQUE,
  test_date TEXT,
  laboratory TEXT,
  result TEXT NOT NULL DEFAULT 'Đạt',
  notes TEXT
);
CREATE TABLE IF NOT EXISTS storage(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  product_code TEXT NOT NULL UNIQUE,
  start_date TEXT,
  location TEXT,
  condition TEXT,
  status TEXT NOT NULL DEFAULT 'Đạt'
);
CREATE TABLE IF NOT EXISTS distribution(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  product_code TEXT NOT NULL,
  distributor TEXT,
  destination TEXT,
  dispatch_date TEXT,
  status TEXT NOT NULL DEFAULT 'Đang phân phối'
);
CREATE TABLE IF NOT EXISTS cases(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT,
  product_code TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'Mới',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS activity_logs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function seed() {
  const count = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  if (count === 0) {
    db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)")
      .run("MelaTrace Admin", "admin@melatrace.vn", bcrypt.hashSync("Admin@123456", 10), "admin");
    db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)")
      .run("Khách hàng Demo", "customer@melatrace.vn", bcrypt.hashSync("Customer@123456", 10), "customer");
  }

  if (db.prepare("SELECT COUNT(*) c FROM materials").get().c === 0) {
    db.prepare(`INSERT INTO materials(code,name,region,farmer,harvest_date,status,notes)
      VALUES('NL-2026-001','Tràm Năm Gân tươi','Vùng nguyên liệu U Minh','HTX Tràm Xanh','2026-01-18','Đạt','Vùng nguyên liệu được kiểm soát theo lô.')`).run();

    const p = db.prepare(`INSERT INTO production_batches(code,material_code,production_date,facility,status,notes) VALUES(?,?,?,?,?,?)`);
    p.run("SX-2026-001","NL-2026-001","2026-01-20","Nhà máy MelaTrace 01","Hoàn tất","Chiết xuất mẻ A.");
    p.run("SX-2026-002","NL-2026-001","2026-01-22","Nhà máy MelaTrace 01","Hoàn tất","Chiết xuất mẻ B.");

    const prod = db.prepare(`INSERT INTO products(code,name,brand,production_batch_code,manufacture_date,expiry_date,image_url,warning,ingredients_json,certificates_json,references_json)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
    const ingredients = JSON.stringify([
      {name:"Tinh dầu Tràm Năm Gân", amount:"2.0%", use:"Hỗ trợ làm dịu và bảo vệ da"},
      {name:"Vitamin E", amount:"0.5%", use:"Chống oxy hóa"}
    ]);
    const certs = JSON.stringify(["Giấy chứng nhận vùng nguyên liệu.pdf","Phiếu kiểm nghiệm sản phẩm.pdf"]);
    prod.run("SP-2026-011","Tinh dầu Tràm Năm Gân","MelaTrace","SX-2026-001","2026-01-25","2028-01-25","https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80","Bảo quản nơi khô mát, tránh ánh nắng trực tiếp.",ingredients,certs,JSON.stringify(["Dược điển Việt Nam VI","Tiêu chuẩn cơ sở MelaTrace"]));
    prod.run("SP-2026-012","Tinh dầu Tràm Năm Gân Premium","MelaTrace","SX-2026-002","2026-01-27","2028-01-27","https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80","Không để gần nguồn nhiệt.",ingredients,JSON.stringify(["Phiếu kiểm nghiệm sản phẩm.pdf"]),JSON.stringify(["Dược điển Việt Nam VI","Hồ sơ công bố sản phẩm"]));

    const test = db.prepare(`INSERT INTO tests(code,product_code,test_date,laboratory,result,notes) VALUES(?,?,?,?,?,?)`);
    test.run("KN-2026-021","SP-2026-011","2026-01-26","Phòng kiểm nghiệm MelaLab","Đạt","Các chỉ tiêu đạt yêu cầu.");
    test.run("KN-2026-022","SP-2026-012","2026-01-28","Phòng kiểm nghiệm MelaLab","Đạt","Các chỉ tiêu đạt yêu cầu.");

    const stor = db.prepare(`INSERT INTO storage(code,product_code,start_date,location,condition,status) VALUES(?,?,?,?,?,?)`);
    stor.run("BQ-2026-021","SP-2026-011","2026-01-27","Kho thành phẩm A","20–25°C, khô ráo","Đạt");
    stor.run("BQ-2026-022","SP-2026-012","2026-01-29","Kho thành phẩm A","20–25°C, khô ráo","Đạt");

    const dist = db.prepare(`INSERT INTO distribution(code,product_code,distributor,destination,dispatch_date,status) VALUES(?,?,?,?,?,?)`);
    dist.run("PP-2026-021","SP-2026-011","Mela Distribution","TP. Hồ Chí Minh","2026-01-30","Đang phân phối");
    dist.run("PP-2026-022","SP-2026-012","Mela Distribution","Hà Nội","2026-02-01","Đang phân phối");
  }

  if (db.prepare("SELECT COUNT(*) c FROM cases").get().c === 0) {
    db.prepare(`INSERT INTO cases(code,name,phone,email,product_code,issue_type,description,status)
      VALUES('CASE-001','Nguyễn Minh Anh','0900000000','demo@example.com','SP-2026-011','Nghi ngờ chất lượng','Khách hàng muốn xác minh thông tin lô sản phẩm.','Mới')`).run();
  }
}
seed();

function auth(requiredRole = null) {
  return (req,res,next)=>{
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer ")) return res.status(401).json({message:"Chưa đăng nhập"});
    try {
      req.user = jwt.verify(h.slice(7), JWT_SECRET);
      if (requiredRole && req.user.role !== requiredRole) return res.status(403).json({message:"Không có quyền truy cập"});
      next();
    } catch { res.status(401).json({message:"Phiên đăng nhập không hợp lệ"}); }
  };
}

app.post("/api/auth/register",(req,res)=>{
  const {name,email,password} = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({message:"Vui lòng nhập đủ thông tin, mật khẩu tối thiểu 6 ký tự."});
  try {
    const hash = bcrypt.hashSync(password,10);
    const info = db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'customer')").run(name,email,hash);
    const user = {id:info.lastInsertRowid,name,email,role:"customer"};
    const token = jwt.sign(user,JWT_SECRET,{expiresIn:"7d"});
    res.json({token,user});
  } catch { res.status(409).json({message:"Email đã tồn tại."}); }
});
app.post("/api/auth/login",(req,res)=>{
  const {email,password} = req.body;
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u || !bcrypt.compareSync(password,u.password_hash)) return res.status(401).json({message:"Email hoặc mật khẩu không đúng."});
  const user={id:u.id,name:u.name,email:u.email,role:u.role};
  res.json({token:jwt.sign(user,JWT_SECRET,{expiresIn:"7d"}),user});
});
app.get("/api/auth/me",auth(),(req,res)=>res.json(req.user));

app.get("/api/products/:code",(req,res)=>{
  const p = db.prepare("SELECT * FROM products WHERE code=?").get(req.params.code);
  if (!p) return res.status(404).json({message:"Không tìm thấy mã sản phẩm."});
  const batch = db.prepare("SELECT * FROM production_batches WHERE code=?").get(p.production_batch_code);
  const material = batch ? db.prepare("SELECT * FROM materials WHERE code=?").get(batch.material_code) : null;
  const test = db.prepare("SELECT * FROM tests WHERE product_code=?").get(p.code);
  const storage = db.prepare("SELECT * FROM storage WHERE product_code=?").get(p.code);
  const distribution = db.prepare("SELECT * FROM distribution WHERE product_code=?").get(p.code);
  res.json({...p,ingredients:JSON.parse(p.ingredients_json),certificates:JSON.parse(p.certificates_json),references:JSON.parse(p.references_json),batch,material,test,storage,distribution});
});

app.get("/api/products",auth("admin"),(req,res)=>res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all().map(p=>({...p,ingredients:JSON.parse(p.ingredients_json),certificates:JSON.parse(p.certificates_json),references:JSON.parse(p.references_json)}))));
app.post("/api/products",auth("admin"),(req,res)=>{
  const p=req.body;
  try{
    db.prepare(`INSERT INTO products(code,name,brand,production_batch_code,manufacture_date,expiry_date,image_url,warning,ingredients_json,certificates_json,references_json) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
      .run(p.code,p.name,p.brand,p.production_batch_code,p.manufacture_date,p.expiry_date,p.image_url||"",p.warning||"",JSON.stringify(p.ingredients||[]),JSON.stringify(p.certificates||[]),JSON.stringify(p.references||["Dược điển Việt Nam VI"]));
    db.prepare("INSERT INTO activity_logs(admin_name,action,code) VALUES(?,?,?)").run(req.user.name,"Thêm sản phẩm",p.code);
    res.json({message:"Đã tạo sản phẩm"});
  }catch(e){res.status(400).json({message:"Không thể tạo sản phẩm: "+e.message});}
});
app.put("/api/products/:code",auth("admin"),(req,res)=>{
  const p=req.body;
  db.prepare(`UPDATE products SET name=?,brand=?,production_batch_code=?,manufacture_date=?,expiry_date=?,image_url=?,warning=?,ingredients_json=?,certificates_json=?,references_json=? WHERE code=?`)
    .run(p.name,p.brand,p.production_batch_code,p.manufacture_date,p.expiry_date,p.image_url||"",p.warning||"",JSON.stringify(p.ingredients||[]),JSON.stringify(p.certificates||[]),JSON.stringify(p.references||[]),req.params.code);
  db.prepare("INSERT INTO activity_logs(admin_name,action,code) VALUES(?,?,?)").run(req.user.name,"Chỉnh sửa sản phẩm",req.params.code);
  res.json({message:"Đã cập nhật sản phẩm"});
});
app.delete("/api/products/:code",auth("admin"),(req,res)=>{
  db.prepare("DELETE FROM products WHERE code=?").run(req.params.code);
  db.prepare("INSERT INTO activity_logs(admin_name,action,code) VALUES(?,?,?)").run(req.user.name,"Xóa sản phẩm",req.params.code);
  res.json({message:"Đã xóa sản phẩm"});
});

app.get("/api/admin/stats",auth("admin"),(req,res)=>{
  const q=t=>db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
  res.json({materials:q("materials"),production_batches:q("production_batches"),products:q("products"),tests:q("tests"),storage:q("storage"),distribution:q("distribution"),cases:q("cases")});
});
app.get("/api/admin/search",auth("admin"),(req,res)=>{
  const term=`%${req.query.q||""}%`;
  const products=db.prepare("SELECT code,name FROM products WHERE code LIKE ? OR name LIKE ? LIMIT 10").all(term,term);
  const batches=db.prepare("SELECT code,'production' type FROM production_batches WHERE code LIKE ? LIMIT 10").all(term);
  const materials=db.prepare("SELECT code,'material' type FROM materials WHERE code LIKE ? LIMIT 10").all(term);
  res.json([...products.map(x=>({...x,type:"product"})),...batches,...materials]);
});

app.get("/api/admin/cases",auth("admin"),(req,res)=>res.json(db.prepare("SELECT * FROM cases ORDER BY id DESC").all()));
app.get("/api/admin/cases/:code",auth("admin"),(req,res)=>{
  const c=db.prepare("SELECT * FROM cases WHERE code=?").get(req.params.code);
  if(!c)return res.status(404).json({message:"Không tìm thấy báo cáo."});
  if(c.status==="Mới") db.prepare("UPDATE cases SET status='Đang xử lý',updated_at=CURRENT_TIMESTAMP WHERE code=?").run(c.code);
  db.prepare("INSERT INTO activity_logs(admin_name,action,code) VALUES(?,?,?)").run(req.user.name,"Mở chi tiết báo cáo",c.code);
  res.json(db.prepare("SELECT * FROM cases WHERE code=?").get(c.code));
});
app.patch("/api/admin/cases/:code/status",auth("admin"),(req,res)=>{
  const allowed=["Mới","Đang xử lý","Đã xác minh","Đã giải quyết"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({message:"Trạng thái không hợp lệ."});
  db.prepare("UPDATE cases SET status=?,updated_at=CURRENT_TIMESTAMP WHERE code=?").run(req.body.status,req.params.code);
  db.prepare("INSERT INTO activity_logs(admin_name,action,code) VALUES(?,?,?)").run(req.user.name,"Cập nhật trạng thái: "+req.body.status,req.params.code);
  res.json({message:"Đã cập nhật trạng thái"});
});

app.post("/api/cases", (req,res)=>{
  const {name,phone,email,product_code,issue_type,description,attachments=[]}=req.body;
  const code="CASE-"+String((db.prepare("SELECT COUNT(*) c FROM cases").get().c)+1).padStart(3,"0");
  try{
    db.prepare(`INSERT INTO cases(code,name,phone,email,product_code,issue_type,description,attachments_json) VALUES(?,?,?,?,?,?,?,?)`)
      .run(code,name,phone,email,product_code,issue_type,description,JSON.stringify(attachments));
    res.json({message:"Xin lỗi quý khách vì sự bất tiện này. Báo cáo đã được ghi nhận và chuyển đến bộ phận phụ trách để xác minh. Chúng tôi sẽ liên hệ với quý khách sớm nhất có thể.",code});
  }catch(e){res.status(400).json({message:"Không thể gửi báo cáo: "+e.message});}
});

app.get("/api/admin/logs",auth("admin"),(req,res)=>res.json(db.prepare("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 100").all()));

app.get("/api/admin/trace/:code",auth("admin"),(req,res)=>{
  const p=db.prepare("SELECT * FROM products WHERE code=?").get(req.params.code);
  if(!p)return res.status(404).json({message:"Không tìm thấy sản phẩm"});
  const batch=db.prepare("SELECT * FROM production_batches WHERE code=?").get(p.production_batch_code);
  const material=batch && db.prepare("SELECT * FROM materials WHERE code=?").get(batch.material_code);
  const test=db.prepare("SELECT * FROM tests WHERE product_code=?").get(p.code);
  const storage=db.prepare("SELECT * FROM storage WHERE product_code=?").get(p.code);
  const distribution=db.prepare("SELECT * FROM distribution WHERE product_code=?").get(p.code);
  res.json({product:p,batch,material,test,storage,distribution});
});

const upload = multer({storage:multer.diskStorage({
  destination:uploadDir,
  filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname.replace(/[^a-zA-Z0-9._-]/g,"_"))
}),limits:{files:3,size:20*1024*1024}});

app.post("/api/uploads",upload.array("files",3),(req,res)=>res.json({
  files:req.files.map(f=>"/uploads/"+f.filename)
}));

const clientDist = path.join(process.cwd(), "..", "client", "dist");

app.use(express.static(clientDist));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT,()=>console.log(`MelaTrace API running on port ${PORT}`));
