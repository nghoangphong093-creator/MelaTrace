import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter,useNavigate,useLocation,Routes,Route,Link} from "react-router-dom";
import axios from "axios";
import {LayoutDashboard,Leaf,Factory,PackageCheck,FlaskConical,Warehouse,Truck,FileWarning,BarChart3,ScrollText,Search,LogOut,Menu,ArrowLeft,UserCircle,ShieldCheck,MapPin,ChevronRight,CheckCircle2,AlertCircle,Clock3,Eye,Trash2,Plus,Save,RefreshCw} from "lucide-react";
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from "recharts";
import "./styles.css";

const api=axios.create({baseURL:"/api"});
api.interceptors.request.use(c=>{const t=localStorage.getItem("melatrace_token");if(t)c.headers.Authorization=`Bearer ${t}`;return c});
const demoTrace=[
 {key:"material",label:"Vùng trồng",icon:Leaf},
 {key:"harvest",label:"Thu hoạch",icon:Leaf},
 {key:"batch",label:"Sản xuất",icon:Factory},
 {key:"test",label:"Kiểm nghiệm",icon:FlaskConical},
 {key:"storage",label:"Bảo quản",icon:Warehouse},
 {key:"distribution",label:"Phân phối",icon:Truck},
 {key:"product",label:"Sản phẩm",icon:PackageCheck}
];

function Toast({msg,type="success",onClose}){if(!msg)return null;return <div className={"toast "+type}>{type==="success"?<CheckCircle2/>:<AlertCircle/>}<span>{msg}</span><button onClick={onClose}>×</button></div>}
function Logo(){return <Link to="/" className="logo"><span className="logo-mark"><Leaf size={19}/></span><span>Mela<span>Trace</span></span></Link>}
function Loading(){return <div className="loading"><div className="spinner"/>Đang tải dữ liệu…</div>}
function Protected({children,role}){const [ok,setOk]=useState(null);useEffect(()=>{api.get("/auth/me").then(r=>{setOk(!role||r.data.role===role)}).catch(()=>setOk(false))},[role]);if(ok===null)return <Loading/>;if(!ok)return <NavigateLogin/>;return children}
function NavigateLogin(){window.location.href="/login";return null}
function AuthProvider({children}){return children}

function CustomerHeader(){
 const nav=useNavigate(); const [u,setU]=useState(null);
 useEffect(()=>{api.get("/auth/me").then(r=>setU(r.data)).catch(()=>{})},[]);
 const logout=()=>{localStorage.removeItem("melatrace_token");nav("/login")};
 return <header className="customer-header"><Logo/><nav><Link to="/">Tra cứu</Link>{u&&<Link to="/report">Báo cáo sự cố</Link>}{u?<div className="user-menu"><UserCircle/><span>{u.name}</span><button onClick={logout}>Đăng xuất</button></div>:<Link className="btn btn-primary small" to="/login">Đăng nhập</Link>}</nav></header>
}

function CustomerHome(){
 const [code,setCode]=useState("");const nav=useNavigate();
 return <><CustomerHeader/><main>
  <section className="hero">
   <div className="hero-copy"><span className="eyebrow"><ShieldCheck size={16}/> Nền tảng truy xuất nguồn gốc hai chiều</span>
   <h1>MelaTrace — <em>Minh bạch</em> từ vùng đất đến sản phẩm</h1>
   <p>Kiểm chứng hành trình sản phẩm Tràm Năm Gân từ vùng nguyên liệu đến tay bạn bằng một mã truy xuất duy nhất.</p>
   <form className="trace-search" onSubmit={e=>{e.preventDefault();if(code.trim())nav("/product/"+code.trim())}}>
    <Search/><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Nhập mã sản phẩm, ví dụ SP-2026-011"/><button className="btn btn-primary">Tra cứu</button>
   </form>
   <div className="trust-row"><span><CheckCircle2/> Dữ liệu liên kết</span><span><CheckCircle2/> Hồ sơ điện tử</span><span><CheckCircle2/> Feedback trực tiếp</span></div>
   </div>
   <div className="hero-visual"><div className="leaf-orbit"><Leaf size={110}/><div className="orbit o1"/><div className="orbit o2"/></div></div>
  </section>
  <section className="section"><div className="section-heading"><div><span className="eyebrow">Cách hoạt động</span><h2>Một mã — một hành trình minh bạch</h2></div></div>
  <div className="feature-grid"><Feature icon={Search} title="Tra cứu sản phẩm" text="Nhập mã trên bao bì để mở Digital Product Passport."/><Feature icon={MapPin} title="Truy xuất ngược" text="Đi từ sản phẩm về lô sản xuất, kiểm nghiệm và vùng trồng."/><Feature icon={FileWarning} title="Gửi Feedback" text="Báo cáo bất thường để đội ngũ xác minh và xử lý." /></div></section>
 </main><footer>MelaTrace © 2026 · Minh bạch từ vùng nguyên liệu đến sản phẩm</footer></>
}
function Feature({icon:Icon,title,text}){return <div className="feature"><div className="icon-box"><Icon/></div><h3>{title}</h3><p>{text}</p></div>}

function Login(){
 const nav=useNavigate();const [register,setRegister]=useState(false);const [f,setF]=useState({name:"",email:"",password:""});const [show,setShow]=useState(false);const [busy,setBusy]=useState(false);const [toast,setToast]=useState("");
 const submit=async e=>{e.preventDefault();setBusy(true);try{const r=await api.post(register?"/auth/register":"/auth/login",f);localStorage.setItem("melatrace_token",r.data.token);setToast("Đăng nhập thành công");setTimeout(()=>nav(r.data.user.role==="admin"?"/admin":"/"),500)}catch(e){setToast(e.response?.data?.message||"Có lỗi xảy ra")}finally{setBusy(false)}};
 return <div className="auth-page"><div className="auth-visual"><Logo/><div className="auth-leaves"><Leaf size={180}/></div><h2>Minh bạch từ vùng nguyên liệu đến sản phẩm.</h2><p>MelaTrace kết nối dữ liệu truy xuất, kiểm nghiệm, bảo quản và phản hồi trong cùng một hệ thống.</p></div>
 <div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="eyebrow">{register?"Tạo tài khoản":"Chào mừng trở lại"}</span><h1>{register?"Đăng ký MelaTrace":"Đăng nhập MelaTrace"}</h1>
 {register&&<label>Họ tên<input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>}
 <label>Email<input required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label>
 <label>Mật khẩu<div className="password"><input required type={show?"text":"password"} value={f.password} onChange={e=>setF({...f,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)}> {show?"Ẩn":"Hiện"} </button></div></label>
 {!register&&<div className="form-row"><label className="check"><input type="checkbox"/> Ghi nhớ</label><button type="button" className="link-btn">Quên mật khẩu?</button></div>}
 <button disabled={busy} className="btn btn-primary full">{busy?<><span className="mini-spinner"/>Đang xử lý…</>:register?"Đăng ký":"Đăng nhập"}</button>
 <button type="button" className="switch" onClick={()=>setRegister(!register)}>{register?"Đã có tài khoản? Đăng nhập":"Chưa có tài khoản? Đăng ký"}</button>
 <div className="demo-box">Admin demo: <b>admin@melatrace.vn</b> / <b>Admin@123456</b></div>
 </form></div><Toast msg={toast} type={toast.includes("thành công")?"success":"error"} onClose={()=>setToast("")}/></div>
}

function ProductPage(){
 const {code}=useParams();const [p,setP]=useState(null);const [err,setErr]=useState("");const [tab,setTab]=useState("passport");const nav=useNavigate();
 useEffect(()=>{api.get("/products/"+code).then(r=>setP(r.data)).catch(e=>setErr(e.response?.data?.message||"Không tìm thấy sản phẩm."))},[code]);
 if(err)return <><CustomerHeader/><main className="page-center"><AlertCircle size={48}/><h2>{err}</h2><Link className="btn btn-primary" to="/">Tra cứu lại</Link></main></>;
 if(!p)return <><CustomerHeader/><Loading/></>;
 const trace=[
  {key:"material",label:"Vùng trồng",title:p.material?.code,desc:p.material?.region+" · "+p.material?.farmer,icon:Leaf},
  {key:"harvest",label:"Thu hoạch",title:p.material?.harvest_date,desc:"Thu hoạch lô "+p.material?.code,icon:Leaf},
  {key:"batch",label:"Sản xuất",title:p.batch?.code,desc:p.batch?.facility+" · "+p.batch?.production_date,icon:Factory},
  {key:"test",label:"Kiểm nghiệm",title:p.test?.code,desc:p.test?.laboratory+" · "+p.test?.result,icon:FlaskConical},
  {key:"storage",label:"Bảo quản",title:p.storage?.code,desc:p.storage?.location+" · "+p.storage?.condition,icon:Warehouse},
  {key:"distribution",label:"Phân phối",title:p.distribution?.code,desc:p.distribution?.destination+" · "+p.distribution?.dispatch_date,icon:Truck},
  {key:"product",label:"Sản phẩm",title:p.code,desc:p.name,icon:PackageCheck}
 ];
 return <><CustomerHeader/><main className="product-page">
  <button className="back-link" onClick={()=>nav(-1)}><ArrowLeft/> Quay lại</button>
  <section className="product-hero"><img src={p.image_url}/><div><span className="status-pill ok"><CheckCircle2 size={15}/> Đã xác thực</span><h1>{p.name}</h1><p className="muted">{p.brand} · <b>{p.code}</b></p><div className="meta-grid"><Meta label="Ngày sản xuất" value={p.manufacture_date}/><Meta label="Hạn sử dụng" value={p.expiry_date}/><Meta label="Lô sản xuất" value={p.production_batch_code}/></div><div className="notice"><AlertCircle/> {p.warning}</div></div></section>
  <section className="passport"><div className="tabs"><button className={tab==="passport"?"active":""} onClick={()=>setTab("passport")}>Hồ sơ điện tử</button><button className={tab==="trace"?"active":""} onClick={()=>setTab("trace")}>Truy xuất nguồn gốc</button></div>
  {tab==="passport"?<div className="passport-grid"><div><h2>Bảng thành phần</h2><div className="table-wrap"><table><thead><tr><th>Hoạt chất</th><th>Hàm lượng</th><th>Công dụng chính</th></tr></thead><tbody>{p.ingredients.map((x,i)=><tr key={i}><td>{x.name}</td><td>{x.amount}</td><td>{x.use}</td></tr>)}</tbody></table></div></div><div className="passport-side"><h3>Giấy chứng nhận</h3>{p.certificates.map((x,i)=><div className="file-row" key={i}><ScrollText/> {x}<span>PDF</span></div>)}<h3>Tài liệu tham khảo</h3><ul>{p.references.map((x,i)=><li key={i}>{x}</li>)}</ul></div></div>
  :<div className="trace-section"><div className="trace-intro"><span className="eyebrow">Truy xuất ngược</span><h2>Từ sản phẩm về vùng nguyên liệu</h2><p>Chuỗi dữ liệu được liên kết thực từ hồ sơ MelaTrace.</p></div><div className="timeline">{trace.map((x,i)=>{const Icon=x.icon;return <div className="timeline-item" key={x.key}><div className="timeline-node"><Icon/></div><div className="timeline-card"><span>{x.label}</span><b>{x.title||"—"}</b><p>{x.desc||"Chưa có dữ liệu"}</p></div></div>})}</div></div>}
  </section>
  <div className="report-cta"><div><h3>Phát hiện điều bất thường?</h3><p>Gửi báo cáo để MelaTrace tiếp nhận và xác minh.</p></div><Link className="btn btn-danger" to={"/report?product="+p.code}><FileWarning/> Báo cáo sự cố</Link></div>
 </main></>
}
function Meta({label,value}){return <div><span>{label}</span><b>{value}</b></div>}

function ReportPage(){
 const qs=new URLSearchParams(useLocation().search);const [f,setF]=useState({name:"",phone:"",email:"",product_code:qs.get("product")||"",issue_type:"Thông tin sản phẩm bất thường",description:""});const [files,setFiles]=useState([]);const [busy,setBusy]=useState(false);const [done,setDone]=useState("");const [err,setErr]=useState("");
 const issues=["Thông tin sản phẩm bất thường","Màu sắc/mùi hương bất thường","Phản ứng khi sử dụng","Bao bì bất thường","Nghi ngờ nguồn gốc","Nghi ngờ chất lượng","Nghi ngờ tính xác thực","Vấn đề khác"];
 const submit=async e=>{e.preventDefault();setBusy(true);try{let at=[];if(files.length){const fd=new FormData();files.forEach(x=>fd.append("files",x));const u=await api.post("/uploads",fd);at=u.data.files}const r=await api.post("/cases",{...f,attachments:at});setDone(r.data.message)}catch(e){setErr(e.response?.data?.message||"Không thể gửi báo cáo")}finally{setBusy(false)}};
 if(done)return <><CustomerHeader/><main className="success-page"><CheckCircle2 size={70}/><h1>Đã ghi nhận báo cáo</h1><p>{done}</p><Link className="btn btn-primary" to="/">Về trang tra cứu</Link></main></>;
 return <><CustomerHeader/><main className="form-page"><button className="back-link" onClick={()=>history.back()}><ArrowLeft/> Quay lại</button><div className="form-head"><span className="eyebrow">Feedback</span><h1>Báo cáo sự cố</h1><p>Cung cấp thông tin để đội ngũ MelaTrace xác minh nhanh và chính xác.</p></div><form className="report-form" onSubmit={submit}><div className="form-grid"><Field label="Tên người dùng" value={f.name} set={v=>setF({...f,name:v})} required/><Field label="Số điện thoại" value={f.phone} set={v=>setF({...f,phone:v})} required/><Field label="Email" type="email" value={f.email} set={v=>setF({...f,email:v})} required/><Field label="Mã sản phẩm" value={f.product_code} set={v=>setF({...f,product_code:v})} required/></div><label>Loại vấn đề<select value={f.issue_type} onChange={e=>setF({...f,issue_type:e.target.value})}>{issues.map(x=><option key={x}>{x}</option>)}</select></label><label>Mô tả sự cố chi tiết<textarea rows="7" required value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Mô tả hiện tượng, thời điểm, tình trạng bao bì…"/></label><label>Đính kèm ảnh/video <span className="caption">Tối đa 3 tệp</span><input type="file" multiple accept="image/*,video/*" onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,3))}/></label><div className="selected-files">{files.map(x=><span key={x.name}>{x.name}</span>)}</div>{err&&<div className="inline-error">{err}</div>}<button className="btn btn-primary" disabled={busy}>{busy?"Đang gửi…":"Gửi báo cáo"}</button></form></main></>
}
function Field({label,value,set,type="text",required}){return <label>{label}<input required={required} type={type} value={value} onChange={e=>set(e.target.value)}/></label>}

function AdminLayout(){
 const location=useLocation();
 const nav=useNavigate();const [open,setOpen]=useState(true);const [q,setQ]=useState("");const [user,setUser]=useState(null);const [results,setResults]=useState([]);

 useEffect(()=>{api.get("/auth/me").then(r=>setUser(r.data))},[]);

 useEffect(()=>{
  if(q.length<2){setResults([]);return}
  const t=setTimeout(()=>api.get("/admin/search",{params:{q}}).then(r=>setResults(r.data)),250);
  return()=>clearTimeout(t)
 },[q]);

 const logout=()=>{localStorage.removeItem("melatrace_token");nav("/login")};

 const menu=[
  ["/admin","Dashboard",LayoutDashboard],
  ["/admin/materials","Nguyên liệu",Leaf],
  ["/admin/production","Sản xuất",Factory],
  ["/admin/products","Sản phẩm",PackageCheck],
  ["/admin/tests","Kiểm nghiệm",FlaskConical],
  ["/admin/storage","Bảo quản",Warehouse],
  ["/admin/distribution","Phân phối",Truck],
  ["/admin/cases","Báo cáo sự cố",FileWarning],
  ["/admin/analytics","Thống kê",BarChart3],
  ["/admin/logs","Nhật ký hoạt động",ScrollText]
 ];

 return <div className="admin-shell">
  <aside className={open?"sidebar":"sidebar collapsed"}>
   <div className="side-top">
    <Logo/>
    <button onClick={()=>setOpen(!open)}><Menu/></button>
   </div>

   <nav>
    {menu.map(([to,label,Icon])=>
     <Link className={location.pathname===to?"active":""} to={to} key={to}>
      <Icon/><span>{label}</span>
     </Link>
    )}
   </nav>

   <div className="side-bottom">
    <button onClick={logout}><LogOut/><span>Đăng xuất</span></button>
   </div>
  </aside>

  <div className="admin-main">
   <header className="admin-top">
    <button className="mobile-menu" onClick={()=>setOpen(!open)}><Menu/></button>
    <button onClick={()=>nav(-1)} className="icon-btn"><ArrowLeft/></button>

    <div className="breadcrumb">
     MelaTrace <ChevronRight size={14}/> Quản trị
    </div>

    <div className="admin-search">
     <Search/>
     <input
      placeholder="Tìm mã sản phẩm, mã lô…"
      value={q}
      onChange={e=>setQ(e.target.value)}
     />

     {results.length>0&&
      <div className="search-results">
       {results.map(x=>
        <Link
         key={x.type+x.code}
         to={x.type==="product"?"/admin/products?code="+x.code:"/admin"}
         onClick={()=>setQ("")}
        >
         <b>{x.code}</b>
         <span>{x.name||x.type}</span>
        </Link>
       )}
      </div>
     }
    </div>

    <div className="top-user">
     <UserCircle/>
     <span>{user?.name||"Admin"}<small>Administrator</small></span>
    </div>
   </header>

   <div className="admin-content">
    <Routes>
     <Route path="/admin" element={<AdminDashboard/>}/>
     <Route path="/admin/materials" element={<CrudList title="Nguyên liệu" endpoint="materials"/>}/>
     <Route path="/admin/production" element={<CrudList title="Sản xuất" endpoint="production_batches"/>}/>
     <Route path="/admin/products" element={<AdminProducts/>}/>
     <Route path="/admin/tests" element={<CrudList title="Kiểm nghiệm" endpoint="tests"/>}/>
     <Route path="/admin/storage" element={<CrudList title="Bảo quản" endpoint="storage"/>}/>
     <Route path="/admin/distribution" element={<CrudList title="Phân phối" endpoint="distribution"/>}/>
     <Route path="/admin/cases" element={<Cases/>}/>
     <Route path="/admin/cases/:code" element={<CaseDetail/>}/>
     <Route path="/admin/analytics" element={<Analytics/>}/>
     <Route path="/admin/logs" element={<Logs/>}/>
    </Routes>
   </div>
  </div>
 </div>
}
function AdminDashboard(){
 const [s,setS]=useState(null);useEffect(()=>{api.get("/admin/stats").then(r=>setS(r.data))},[]);
 if(!s)return <Loading/>;const cards=[["Vùng nguyên liệu",s.materials,Leaf],["Lô nguyên liệu",s.materials,MapPin],["Lô sản xuất",s.production_batches,Factory],["Lô sản phẩm",s.products,PackageCheck],["Kiểm nghiệm",s.tests,FlaskConical],["Bảo quản",s.storage,Warehouse],["Báo cáo sự cố",s.cases,FileWarning]];
 const data=["01","02","03","04","05","06","07"].map(d=>({day:d,truyxuat:0,baocao:0}));
 return <div><PageTitle eyebrow="Dashboard" title="Tổng quan MelaTrace" desc="Theo dõi toàn bộ chuỗi truy xuất nguồn gốc trong thời gian thực."/><div className="kpi-grid">{cards.map(([l,v,I])=><div className="kpi" key={l}><div className="kpi-icon"><I/></div><b>{v}</b><span>{l}</span><small>Đang đồng bộ</small></div>)}</div><div className="quick-actions"><Link to="/admin/products" className="btn btn-primary"><Plus/> Thêm sản phẩm</Link><Link to="/admin/production" className="btn btn-secondary"><Plus/> Tạo lô</Link><Link to="/admin/cases" className="btn btn-secondary"><Eye/> Xem báo cáo</Link></div><div className="chart-grid"><Chart title="Số lượng truy xuất" data={data} keyName="truyxuat"/><Chart title="Số lượng báo cáo" data={data} keyName="baocao"/></div><TraceGraph/></div>
}
function TraceGraph(){const [d,setD]=useState(null);useEffect(()=>{api.get("/products/SP-2026-011").then(r=>setD(r.data))},[]);if(!d)return null;const nodes=[["Vùng nguyên liệu",d.material?.code,d.material?.region],["Thu hoạch",d.material?.harvest_date,"Thu hoạch lô "+d.material?.code],["Sản xuất",d.batch?.code,d.batch?.facility],["Kiểm nghiệm",d.test?.code,d.test?.result],["Bảo quản",d.storage?.code,d.storage?.location],["Phân phối",d.distribution?.code,d.distribution?.destination]];return <section className="trace-graph"><PageTitle eyebrow="Traceability Graph" title="Chuỗi truy xuất hai chiều" desc="Vùng nguyên liệu → Thu hoạch → Sản xuất → Kiểm nghiệm → Bảo quản → Phân phối"/><div className="flow">{nodes.map(([a,b,c],i)=><div className="flow-node" key={a}><div><span>{a}</span><b>{b}</b><small>{c}</small></div>{i<nodes.length-1&&<ChevronRight/>}</div>)}</div></section>}
function Chart({title,data,keyName}){return <div className="chart-card"><div className="chart-head"><h3>{title}</h3><span>7 ngày</span></div><ResponsiveContainer width="100%" height={250}><LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="day"/><YAxis allowDecimals={false}/><Tooltip/><Legend/><Line type="monotone" dataKey={keyName} strokeWidth={2} dot={{r:3}} isAnimationActive/></LineChart></ResponsiveContainer><div className="empty-chart">Chưa có số liệu thực tế — biểu đồ đang ở trạng thái đường ngang.</div></div>}
function PageTitle({eyebrow,title,desc}){return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{desc&&<p>{desc}</p>}</div></div>}

function CrudList({title,endpoint}){
 const [rows,setRows]=useState([]);useEffect(()=>{api.get("/admin/stats").then(()=>{});api.get("/admin/"+endpoint).then(r=>setRows(r.data)).catch(()=>{})},[endpoint]);
 // Generic display uses the seeded related data; write actions are available through products/cases.
 return <div><PageTitle eyebrow="Management" title={title} desc="Danh sách dữ liệu đang được liên kết trong MelaTrace."/><div className="table-card"><div className="table-toolbar"><span>{rows.length} bản ghi</span><button className="btn btn-secondary" onClick={()=>location.reload()}><RefreshCw/> Làm mới</button></div><div className="table-wrap"><table><thead><tr><th>Mã</th><th>Tên/đối tượng</th><th>Trạng thái</th><th>Thông tin</th></tr></thead><tbody>{rows.map(r=><tr key={r.code}><td><b>{r.code}</b></td><td>{r.name||r.product_code||r.material_code||"—"}</td><td><span className="status-pill ok">{r.status||r.result||"—"}</span></td><td>{r.region||r.facility||r.location||r.destination||r.laboratory||"—"}</td></tr>)}</tbody></table></div></div></div>
}
function AdminProducts(){
 const [rows,setRows]=useState([]);const [edit,setEdit]=useState(null);const [msg,setMsg]=useState("");
 const load=()=>api.get("/products").then(r=>setRows(r.data));useEffect(load,[]);
 const blank={code:"",name:"",brand:"MelaTrace",production_batch_code:"SX-2026-001",manufacture_date:"2026-02-01",expiry_date:"2028-02-01",image_url:"",warning:"",ingredients:[],certificates:[],references:["Dược điển Việt Nam VI"]};
 const save=async()=>{try{if(edit.id)await api.put("/products/"+edit.code,edit);else await api.post("/products",edit);setMsg("Đã lưu sản phẩm");setEdit(null);load()}catch(e){setMsg(e.response?.data?.message||"Không thể lưu")}};
 const del=async code=>{if(!confirm("Xóa sản phẩm "+code+"?"))return;await api.delete("/products/"+code);setMsg("Đã xóa sản phẩm");load()};
 return <div><PageTitle eyebrow="Products" title="Quản lý sản phẩm" desc="Chỉnh sửa dữ liệu tại đây sẽ phản ánh trực tiếp ở trang khách hàng."/><div className="table-card"><div className="table-toolbar"><span>{rows.length} sản phẩm</span><button className="btn btn-primary" onClick={()=>setEdit({...blank})}><Plus/> Thêm sản phẩm</button></div><div className="table-wrap"><table><thead><tr><th>Mã</th><th>Sản phẩm</th><th>Lô SX</th><th>Hạn dùng</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.code}><td><b>{r.code}</b></td><td>{r.name}<small>{r.brand}</small></td><td>{r.production_batch_code}</td><td>{r.expiry_date}</td><td className="actions"><button onClick={()=>setEdit(r)}><Eye/></button><button onClick={()=>del(r.code)}><Trash2/></button></td></tr>)}</tbody></table></div></div>{edit&&<Modal title={edit.id?"Chỉnh sửa sản phẩm":"Thêm sản phẩm"} onClose={()=>setEdit(null)}><div className="form-grid"><Field label="Mã sản phẩm" value={edit.code} set={v=>setEdit({...edit,code:v})} required/><Field label="Tên sản phẩm" value={edit.name} set={v=>setEdit({...edit,name:v})} required/><Field label="Thương hiệu" value={edit.brand} set={v=>setEdit({...edit,brand:v})}/><Field label="Lô sản xuất" value={edit.production_batch_code} set={v=>setEdit({...edit,production_batch_code:v})}/><Field label="Ngày sản xuất" value={edit.manufacture_date} set={v=>setEdit({...edit,manufacture_date:v})}/><Field label="Hạn sử dụng" value={edit.expiry_date} set={v=>setEdit({...edit,expiry_date:v})}/></div><label>Ảnh sản phẩm (URL)<input value={edit.image_url||""} onChange={e=>setEdit({...edit,image_url:e.target.value})}/></label><label>Lưu ý<textarea value={edit.warning||""} onChange={e=>setEdit({...edit,warning:e.target.value})}/></label><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setEdit(null)}>Hủy</button><button className="btn btn-primary" onClick={save}><Save/> Lưu thay đổi</button></div></Modal>}{msg&&<Toast msg={msg} onClose={()=>setMsg("")}/>}</div>
}
function Modal({title,onClose,children}){return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>}

function Cases(){
 const [rows,setRows]=useState([]);useEffect(()=>{api.get("/admin/cases").then(r=>setRows(r.data))},[]);
 const colors={"Mới":"new","Đang xử lý":"processing","Đã xác minh":"verified","Đã giải quyết":"resolved"};
 return <div><PageTitle eyebrow="Feedback" title="Báo cáo sự cố" desc="Quản lý toàn bộ feedback từ khách hàng và kích hoạt quy trình xác minh."/><div className="table-card"><div className="table-toolbar"><span>{rows.length} báo cáo</span><span className="caption">Mới → Đang xử lý → Đã xác minh → Đã giải quyết</span></div><div className="table-wrap"><table><thead><tr><th>Mã báo cáo</th><th>Khách hàng</th><th>Sản phẩm</th><th>Loại vấn đề</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.code}><td><b>{r.code}</b></td><td>{r.name}<small>{r.email}</small></td><td>{r.product_code}</td><td>{r.issue_type}</td><td>{new Date(r.created_at).toLocaleString("vi-VN")}</td><td><span className={"status-pill "+colors[r.status]}>{r.status}</span></td><td><Link className="btn btn-secondary xs" to={"/admin/cases/"+r.code}><Eye/> Xem</Link></td></tr>)}</tbody></table></div></div></div>
}
function CaseDetail(){
 const {code}=useParams();const [c,setC]=useState(null);const [trace,setTrace]=useState(null);const [msg,setMsg]=useState("");
 const load=()=>api.get("/admin/cases/"+code).then(r=>setC(r.data));useEffect(load,[]);
 const status=async s=>{await api.patch("/admin/cases/"+code+"/status",{status:s});setMsg("Đã cập nhật");load()};
 const reverse=async()=>{const r=await api.get("/admin/trace/"+c.product_code);setTrace(r.data)};
 if(!c)return <Loading/>;
 const steps=[["Báo cáo",c.code,c.issue_type],["Sản phẩm",c.product_code,"Mã sản phẩm"],["Sản xuất",trace?.batch?.code||"Chưa truy xuất",""],["Nguyên liệu",trace?.material?.code||"Chưa truy xuất",trace?.material?.region||""]];
 return <div><Link className="back-link" to="/admin/cases"><ArrowLeft/> Quay lại danh sách</Link><PageTitle eyebrow="Case Detail" title={c.code} desc={c.description}/><div className="detail-grid"><div className="detail-card"><h3>Thông tin khách hàng</h3><Info label="Họ tên" value={c.name}/><Info label="Số điện thoại" value={c.phone}/><Info label="Email" value={c.email}/><Info label="Mã sản phẩm" value={c.product_code}/><Info label="Loại vấn đề" value={c.issue_type}/><Info label="Thời gian" value={new Date(c.created_at).toLocaleString("vi-VN")}/></div><div className="detail-card"><h3>Trạng thái xử lý</h3><span className="status-pill">{c.status}</span><div className="status-actions"><button disabled={c.status==="Đã xác minh"||c.status==="Đã giải quyết"} className="btn btn-secondary" onClick={()=>status("Đã xác minh")}><ShieldCheck/> Xác minh</button><button disabled={c.status==="Đã giải quyết"} className="btn btn-primary" onClick={()=>status("Đã giải quyết")}><CheckCircle2/> Đã xử lý</button></div></div></div><div className="trace-admin"><div className="trace-head"><div><span className="eyebrow">Truy xuất ngược</span><h2>Khoanh vùng từ báo cáo → vùng trồng</h2></div><button className="btn btn-primary" onClick={reverse}><Search/> Truy xuất khoanh vùng</button></div>{trace?<div className="admin-timeline">{steps.map(([a,b,d],i)=><div className="admin-step" key={a}><div className="step-dot"/><div><span>{a}</span><b>{b}</b><small>{d}</small>{i===2&&trace?.product&&<button className="link-btn" onClick={()=>setMsg("Truy xuất xuôi: "+trace.product.code+" · "+trace.product.name)}>Truy xuất sản phẩm liên quan →</button>}</div></div>)}</div>:<div className="empty-state"><MapPin/>Bấm “Truy xuất khoanh vùng” để dựng chuỗi liên kết.</div>}</div>{msg&&<Toast msg={msg} onClose={()=>setMsg("")}/>}</div>
}
function Info({label,value}){return <div className="info-row"><span>{label}</span><b>{value||"—"}</b></div>}
function Analytics(){const [range,setRange]=useState("7");const data=Array.from({length:Number(range)==7?7:Number(range)==30?10:12},(_,i)=>({day:i+1,truyxuat:0,baocao:0}));return <div><PageTitle eyebrow="Analytics" title="Thống kê" desc="Theo dõi xu hướng truy xuất và báo cáo sự cố."/><div className="analytics-toolbar"><div>{["7","30","90","365"].map(x=><button className={range===x?"active":""} onClick={()=>setRange(x)} key={x}>{x==="365"?"1 năm":x+" ngày"}</button>)}</div><button className="btn btn-secondary" onClick={()=>alert("Bản Export Report đã sẵn sàng để tích hợp xuất CSV/PDF.")}>Export Report</button></div><div className="chart-grid"><Chart title="Số lượng truy xuất của khách hàng" data={data} keyName="truyxuat"/><Chart title="Số lượng báo cáo sự cố" data={data} keyName="baocao"/></div></div>}
function Logs(){const [rows,setRows]=useState([]);useEffect(()=>{api.get("/admin/logs").then(r=>setRows(r.data))},[]);return <div><PageTitle eyebrow="Audit Trail" title="Nhật ký hoạt động" desc="Theo dõi các hành động quan trọng của Admin."/><div className="table-card"><div className="table-wrap"><table><thead><tr><th>Admin</th><th>Ngày / giờ</th><th>Nội dung</th><th>Mã</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.admin_name}</td><td>{new Date(x.created_at).toLocaleString("vi-VN")}</td><td>{x.action}</td><td>{x.code||"—"}</td></tr>)}</tbody></table></div></div></div>}

function App(){
 const loc=useLocation();const admin=loc.pathname.startsWith("/admin");
 return admin?<Protected role="admin"><AdminLayout/></Protected>:<Routes><Route path="/" element={<CustomerHome/>}/><Route path="/login" element={<Login/>}/><Route path="/product/:code" element={<ProductPage/>}/><Route path="/report" element={<ReportPage/>}/></Routes>
}
function useParams(){const m=useLocation().pathname.match(/\/(?:product|admin\/cases)\/([^/]+)/);return {code:m?.[1]}}
createRoot(document.getElementById("root")).render(<BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter>);
