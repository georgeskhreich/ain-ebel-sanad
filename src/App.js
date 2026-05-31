import React, { useState, useEffect, useRef } from 'react';
// استيراد مكتبات Firebase اللازمة للعمل أونلاين بالكامل
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

// ==========================================
// إعدادات وتكوين نظام Firebase السحابي
// ==========================================
// سيتم استبدال هذه القيم ببيانات Firebase الحقيقية للمستخدم
const firebaseConfig = {
  // يرجى لصق قيم Firebase الخاصة بك هنا
  apiKey: "AIzaSyB2E40ctcxOEtKbURfxDlvUluNfnZuukRo",
  authDomain: "ain-ebel-sanad.firebaseapp.com",
  projectId: "ain-ebel-sanad",
  storageBucket: "ain-ebel-sanad.firebasestorage.app",
  messagingSenderId: "1033988646153",
  appId: "1:1033988646153:web:7c606c945917c4aa3b9fd8",
  measurementId: "G-EY6T4E6SKJ"
};

// تهيئة خدمات Firebase الأساسية
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("خطأ في تهيئة Firebase. تأكد من إدخال بيانات التكوين الصحيحة.", error);
}

const appId = 'sanad-ain-ebel-v1'; // معرّف التطبيق الفريد لبلدية عين إبل

// البيانات النموذجية الأولية لرفعها عند أول استخدام لقاعدة البيانات السحابية
const SEED_SURVEYS = [
  {
    ownerName: "خالد محمود عبد الله",
    ownerPhone: "0798765432",
    ownerId: "1002938475",
    propertyType: "منزل مستقل",
    gps: { 
      lat: 33.1102, 
      lng: 35.4025, 
      address: "عين إبل، حارة البيادر - بجانب كنيسة السيدة",
      locationUrl: "https://maps.app.goo.gl/K8f9X4zY7w2R1Q8p7"
    },
    timestamp: "2026-05-28 10:15",
    engineerName: "م. أحمد الشامي",
    structural: {
      columns: "تصدعات عميقة",
      beams: "ترخيم ملحوظ (Deflection)",
      foundations: "سليم"
    },
    nonStructural: {
      walls: "تشققات مائلة (X-Cracks)",
      windows_alu_small: 2,
      windows_alu_large: 3,
      windows_steel: 1,
      windows_facade: 1,
      doors_wood: 4,
      doors_iron: 1
    },
    bathrooms: {
      status: "تدمير كلي وتفجر التمديدات الصحية",
      count: 2
    },
    external: {
      fences: "انهيار جزئي",
      annexes_detailed: {
        garage: { selected: true, area: 35, damage: "تصدع وشروخ عميقة" },
        workroom: { selected: true, area: 15, damage: "انهيار جزئي" },
        attic: { selected: false, area: 0, damage: "سليم" },
        canopy: { selected: true, area: 20, damage: "تفتت بالكامل وتفحم القرميد" }
      },
      gates: "متضررة جزئياً"
    },
    contents: {
      furniture_bedroom_count: 1,
      furniture_bedroom_damage: "تحطم كلي وانضغاط تحت الأنقاض",
      furniture_beds_count: 2,
      furniture_beds_damage: "شروخ وتكسر جزئي بالخشب/الزجاج",
      furniture_wardrobes_count: 1,
      furniture_wardrobes_damage: "تحطم كلي وانضغاط تحت الأنقاض",
      furniture_sofa_count: 1,
      furniture_sofa_damage: "اختراق شظايا وثقوب عصف",
      furniture_dining_count: 6,
      furniture_dining_damage: "شروخ وتكسر جزئي بالخشب/الزجاج",
      furniture_carpet_count: 4,
      furniture_carpet_damage: "تلوث شديد وتلف الأنسجة (غبار/رماد/رطوبة)",
      appliances_fridge: 1,
      appliances_tv: 2,
      appliances_cooker: 1,
      appliances_heater: 3,
      appliances_ac: 2,
      appliances_washing: 1
    },
    notes: "المبنى تعرض لموجة ضغط انفجار عنيفة قريبة جداً مما أدى لدمار كامل للأثاث الداخلي وتفجر الشبكة المائية للحمامات، وتدمير الملاحق الخارجية المتمثلة بالكراج والمظلات.",
    severity: "جسيم / خطر",
    status: "بانتظار الاعتماد",
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    photos: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600"]
  },
  {
    ownerName: "منى محمد السعيد",
    ownerPhone: "0781234567",
    ownerId: "1098374625",
    propertyType: "شقة سكنية",
    gps: { 
      lat: 33.1120, 
      lng: 35.4050, 
      address: "عين إبل، حي عين التحتا",
      locationUrl: ""
    },
    timestamp: "2026-05-29 08:30",
    engineerName: "م. سارة حسن",
    structural: {
      columns: "سليم",
      beams: "سليم",
      foundations: "سليم"
    },
    nonStructural: {
      walls: "تشققات شعرية سطحيّة",
      windows_alu_small: 6,
      windows_alu_large: 4,
      windows_steel: 0,
      windows_facade: 0,
      doors_wood: 1,
      doors_iron: 0
    },
    bathrooms: {
      status: "سليم",
      count: 0
    },
    external: {
      fences: "سليمة",
      annexes_detailed: {
        garage: { selected: false, area: 0, damage: "سليم" },
        workroom: { selected: false, area: 0, damage: "سليم" },
        attic: { selected: false, area: 0, damage: "سليم" },
        canopy: { selected: false, area: 0, damage: "سليم" }
      },
      gates: "سليمة"
    },
    contents: {
      furniture_bedroom_count: 0,
      furniture_bedroom_damage: "سليم",
      furniture_beds_count: 0,
      furniture_beds_damage: "سليم",
      furniture_wardrobes_count: 0,
      furniture_wardrobes_damage: "سليم",
      furniture_sofa_count: 1,
      furniture_sofa_damage: "تلوث شديد وتلف الأنسجة (غبار/رماد/رطوبة)",
      furniture_dining_count: 0,
      furniture_dining_damage: "سليم",
      furniture_carpet_count: 2,
      furniture_carpet_damage: "تلوث شديد وتلف الأنسجة (غبار/رماد/رطوبة)",
      appliances_fridge: 0,
      appliances_tv: 0,
      appliances_cooker: 0,
      appliances_heater: 0,
      appliances_ac: 0,
      appliances_washing: 0
    },
    notes: "الأضرار معمارية سطحية فقط بالزجاج وتلوث السجاد بغبار الانفجارات الخارجي. الهيكل الإنشائي آمن تماماً ولا ملاحق متضررة.",
    severity: "خفيف",
    status: "معتمد",
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    photos: ["https://images.unsplash.com/photo-1579847259174-d361bc9366a7?auto=format&fit=crop&q=80&w=600"]
  }
];

// الحسابات الافتراضية لرفعها في المرة الأولى
const SEED_USERS = [
  { name: "م. أحمد الشامي", username: "engineer", password: "123456", role: "Field_Engineer", createdAt: "2026-05-28" },
  { name: "لجنة البلدية (المشرف العام)", username: "supervisor", password: "admin", role: "Supervisor", createdAt: "2026-05-28" }
];

export default function App() {
  // حالات إدارة المستخدمين والصلاحيات
  const [currentUser, setCurrentUser] = useState(null); 
  const [authError, setAuthError] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [firebaseUser, setFirebaseUser] = useState(null);

  // حالة الشبكة الحقيقية للتطبيق
  const [isOnline, setIsOnline] = useState(true);

  // التبويب النشط
  const [currentTab, setCurrentTab] = useState("field-new"); 

  // مصفوفات تخزين البيانات من السحاب
  const [surveys, setSurveys] = useState([]);
  const [drafts, setDrafts] = useState([]);
  
  // قائمة حسابات المهندسين والمستخدمين السحابية
  const [usersList, setUsersList] = useState([]);

  // نموذج إنشاء مستخدم جديد للـ Admin
  const [newEngineerForm, setNewEngineerForm] = useState({
    name: "",
    username: "",
    password: ""
  });

  // حالة المستخدم الذي يتم تعديل كلمة مروره حالياً
  const [editingUser, setEditingUser] = useState(null);

  // معالج استمارة الإحصاء (Wizard Step)
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerId: "",
    propertyType: "منزل مستقل",
    gps: { lat: 33.1102, lng: 35.4025, address: "عين إبل، جاري تحديد الموقع الميداني..." },
    locationUrl: "", // خانة لصق رابط الموقع الجغرافي من الخرائط
    
    // الهيكل الإنشائي
    structural_columns: "سليم",
    structural_beams: "سليم",
    structural_foundations: "سليم",
    
    // الأضرار المعمارية
    nonStructural_walls: "سليم",
    nonStructural_windows_alu_small: 0,
    nonStructural_windows_alu_large: 0,
    nonStructural_windows_steel: 0,
    nonStructural_windows_facade: 0,
    nonStructural_doors_wood: 0,
    nonStructural_doors_iron: 0,
    
    // بند الحمامات المستقل
    bathroom_status: "سليم",
    bathroom_count: 0,
    
    // الملاحق الخارجية والأسوار
    external_fences: "سليمة",
    external_gates: "سليمة",
    
    // الملاحق الخارجية المفصلة
    external_annex_garage_selected: false,
    external_annex_garage_area: 0,
    external_annex_garage_damage: "سليم",

    external_annex_workroom_selected: false,
    external_annex_workroom_area: 0,
    external_annex_workroom_damage: "سليم",

    external_annex_attic_selected: false,
    external_annex_attic_area: 0,
    external_annex_attic_damage: "سليم",

    external_annex_canopy_selected: false,
    external_annex_canopy_area: 0,
    external_annex_canopy_damage: "سليم",
    
    // جرد الأثاث والمفروشات المفصل بكميات ونوع الخراب
    furniture_bedroom_count: 0,
    furniture_bedroom_damage: "سليم",
    furniture_beds_count: 0,
    furniture_beds_damage: "سليم",
    furniture_wardrobes_count: 0,
    furniture_wardrobes_damage: "سليم",
    furniture_sofa_count: 0,
    furniture_sofa_damage: "سليم",
    furniture_dining_count: 0,
    furniture_dining_damage: "سليم",
    furniture_carpet_count: 0,
    furniture_carpet_damage: "سليم",
    
    // الأجهزة الكهربائية المفصلة
    appliances_fridge: 0,
    appliances_tv: 0,
    appliances_cooker: 0,
    appliances_heater: 0,
    appliances_ac: 0,
    appliances_washing: 0,
    
    notes: "",
    audioNote: null,
    photos: []
  });

  // توقيع الفحص الرقمي
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // مراجع وحالات المايكروفون والكاميرا
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // إدارة الفلاتر والتقارير في لوحة التحكم
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("الكل");

  // الإشعارات المنبثقة التلقائية
  const [toastMessage, setToastMessage] = useState("");

  // أنواع التلف المعتمدة للأثاث
  const DAMAGE_TYPES = [
    "سليم",
    "شروخ وتكسر جزئي بالخشب/الزجاج",
    "اختراق شظايا وثقوب عصف",
    "تلوث شديد وتلف الأنسجة (غبار/رماد/رطوبة)",
    "حروق وتفحم جزئي/كلي",
    "تحطم كلي وانضغاط تحت الأنقاض"
  ];

  // أصناف الملاحق الخارجية
  const ANNEX_TYPES = [
    { id: "garage", label: "كراج (كراج سيارات خارجي مستقل)", icon: "🚗" },
    { id: "workroom", label: "غرفة عمل (غرفة صيانة أو حراسة خارجية)", icon: "🛠️" },
    { id: "attic", label: "سقيفة (مخزن خارجي أو سقيفة علوية)", icon: "📦" },
    { id: "canopy", label: "قرميد (مظلة قرميد خارجية أو برجولة)", icon: "🏡" }
  ];

  // ==========================================
  // إطلاق ومراقبة عمليات الاتصال والمصادقة بـ Firebase
  // ==========================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Firebase Authentication error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // الاتصال بقاعدة البيانات السحابية
  // ==========================================
  useEffect(() => {
    if (!firebaseUser || !db) return;

    // 1. استدعاء الاستمارات الميدانية
    const surveysColRef = collection(db, 'surveys');
    const unsubscribeSurveys = onSnapshot(surveysColRef, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSurveys(list);
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    // 2. استدعاء مستخدمي النظام
    const usersColRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersColRef, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(list);
    }, (error) => {
      console.error("Firestore users loading error:", error);
    });

    return () => {
      unsubscribeSurveys();
      unsubscribeUsers();
    };
  }, [firebaseUser]);

  // تحديث إحداثيات GPS تلقائياً
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gps: {
              lat: parseFloat(position.coords.latitude.toFixed(6)),
              lng: parseFloat(position.coords.longitude.toFixed(6)),
              address: `إحداثيات حية: خط عرض ${position.coords.latitude.toFixed(4)} ، خط طول ${position.coords.longitude.toFixed(4)}`
            }
          }));
        },
        () => {
          // البقاء على موقع عين إبل الافتراضي
        }
      );
    }
  }, [wizardStep]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // تهيئة الاستمارات وقائمة حسابات المهندسين الافتراضية على السيرفر
  const handleSeedDatabase = async () => {
    if (!firebaseUser || !db) {
        showToast("تأكد من إدخال بيانات Firebase الصحيحة في الكود أولاً.");
        return;
    }
    try {
      showToast("جاري تهيئة ورفع البيانات السحابية لبلدية عين إبل...");
      
      const surveysColRef = collection(db, 'surveys');
      for (const item of SEED_SURVEYS) {
        await addDoc(surveysColRef, item);
      }

      const usersColRef = collection(db, 'users');
      for (const user of SEED_USERS) {
        const exists = usersList.some(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (!exists) {
          await addDoc(usersColRef, user);
        }
      }

      showToast("تم رفع البيانات النموذجية لعين إبل أونلاين بنجاح!");
    } catch (e) {
      console.error("Seed failed:", e);
      showToast("تعذر رفع البيانات. يرجى التحقق من اتصال Firebase.");
    }
  };

  // الحساب الذكي لمستويات خطورة الأضرار
  const calculateSeverity = (data) => {
    const isRed = 
      data.structural_columns === "تصدعات عميقة" || 
      data.structural_columns === "انقشاع الخرسانة (Spalling)" || 
      data.structural_columns === "انبعاج حديد التسليح (Buckling)" || 
      data.structural_columns === "فشل كلي/انهيار" ||
      data.structural_beams === "ترخيم ملحوظ (Deflection)" ||
      data.structural_beams === "انفصال الغطاء الخرساني" ||
      data.structural_beams === "اختراق كامل (Punching)" ||
      data.structural_beams === "انهيار جزئي/كلي لبلاد السقف" ||
      data.structural_foundations === "هبوط تفاضلي (Settlement)" ||
      data.bathroom_status === "تدمير كلي وتفجر التمديدات الصحية" ||
      data.furniture_bedroom_damage === "تحطم كلي وانضغاط تحت الأنقاض" ||
      data.furniture_sofa_damage === "تحطم كلي وانضغاط تحت الأنقاض" ||
      (data.external_annex_garage_selected && (data.external_annex_garage_damage === "انهيار كلي" || data.external_annex_garage_damage === "انهيار جزئي")) ||
      (data.external_annex_workroom_selected && (data.external_annex_workroom_damage === "انهيار كلي" || data.external_annex_workroom_damage === "انهيار جزئي")) ||
      (data.external_annex_attic_selected && (data.external_annex_attic_damage === "انهيار كلي" || data.external_annex_attic_damage === "انهيار جزئي")) ||
      (data.external_annex_canopy_selected && (data.external_annex_canopy_damage === "انهيار كلي" || data.external_annex_canopy_damage === "انهيار جزئي"));

    const isOrange = 
      data.structural_columns === "تشققات شعرية سطحيّة" ||
      data.structural_beams === "تشققات عرضية/طولية" ||
      data.structural_foundations === "تصدع في الأساسات" ||
      data.nonStructural_walls === "تشققات مائلة (X-Cracks)" ||
      data.nonStructural_walls === "انهيار جزئي" ||
      data.external_fences === "تصدع وشروخ خطيرة" ||
      data.external_fences === "انهيار جزئي" ||
      data.bathroom_status === "تدمير جزئي (أطقم صحية/مغاسل)" ||
      data.furniture_bedroom_damage === "اختراق شظايا وثقوب عصف" ||
      data.furniture_sofa_damage === "اختراق شظايا وثقوب عصف" ||
      (data.external_annex_garage_selected && data.external_annex_garage_damage === "تصدع وشروخ عميقة") ||
      (data.external_annex_workroom_selected && data.external_annex_workroom_damage === "تصدع وشروخ عميقة") ||
      (data.external_annex_attic_selected && data.external_annex_attic_damage === "تصدع وشروخ عميقة") ||
      (data.external_annex_canopy_selected && data.external_annex_canopy_damage === "تصدع وشروخ عميقة");

    if (isRed) return "جسيم / خطر";
    if (isOrange) return "متوسط";
    return "خفيف";
  };

  // ==========================================
  // بروتوكول رسم التوقيع الرقمي
  // ==========================================
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // ==========================================
  // معالجة عمليات تسجيل الدخول والخروج
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    
    // البحث أولاً في قائمة الحسابات السحابية الحية
    const matchingUser = usersList.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (matchingUser) {
      setCurrentUser({ 
        username: matchingUser.username, 
        role: matchingUser.role,
        name: matchingUser.name 
      });
      setCurrentTab(matchingUser.role === "Supervisor" ? "supervisor-dashboard" : "field-new");
      setAuthError("");
      showToast(`مرحباً بك ${matchingUser.name}. تم تسجيل الدخول السحابي بنجاح.`);
      return;
    }

    // الحسابات الاحتياطية للطوارئ
    if (username.toLowerCase() === "engineer" && password === "123456") {
      setCurrentUser({ username: "engineer", role: "Field_Engineer", name: "م. أحمد الشامي" });
      setCurrentTab("field-new");
      setAuthError("");
      showToast("مرحباً بك مهندس أحمد. تم تسجيل الدخول أونلاين بنجاح.");
    } else if (username.toLowerCase() === "supervisor" && password === "admin") {
      setCurrentUser({ username: "supervisor", role: "Supervisor", name: "لجنة البلدية (المشرف العام)" });
      setCurrentTab("supervisor-dashboard");
      setAuthError("");
      showToast("مرحباً سيادة المشرف. جاري جلب لوحة المتابعة السحابية المباشرة.");
    } else {
      setAuthError("اسم المستخدم أو كلمة المرور غير صحيحة! يرجى إدخال الحسابات المعتمدة.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: "", password: "" });
  };

  // ==========================================
  // إدارة حسابات المهندسين للـ Admin
  // ==========================================
  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    if(!db) { showToast("قاعدة البيانات غير متصلة"); return;}
    const { name, username, password } = newEngineerForm;
    
    if (!name.trim() || !username.trim() || !password.trim()) {
      showToast("الرجاء تعبئة كافة الحقول المطلوبة لإنشاء الحساب.");
      return;
    }

    const usernameExists = usersList.some(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (usernameExists || username.toLowerCase() === "engineer" || username.toLowerCase() === "supervisor") {
      showToast("اسم المستخدم هذا محجوز مسبقاً! يرجى اختيار اسم مستخدم آخر.");
      return;
    }

    try {
      const usersColRef = collection(db, 'users');
      await addDoc(usersColRef, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        role: "Field_Engineer",
        createdAt: new Date().toISOString().substring(0, 10)
      });

      showToast(`تم إنشاء حساب المهندس الميداني ${name} بنجاح!`);
      setNewEngineerForm({ name: "", username: "", password: "" });
    } catch (err) {
      console.error("Error creating user:", err);
      showToast("حدث خطأ أثناء حفظ الحساب الجديد سحابياً.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser.newPassword.trim() || !db) return;

    try {
      const docRef = doc(db, 'users', editingUser.id);
      await updateDoc(docRef, { password: editingUser.newPassword.trim() });
      
      showToast(`تم تغيير كلمة المرور للمستخدم (${editingUser.name}) بنجاح!`);
      setEditingUser(null);
    } catch (err) {
      console.error("Error changing password:", err);
      showToast("فشل تحديث كلمة المرور على السحابة.");
    }
  };

  // ==========================================
  // التقاط الصور والتسجيل الصوتي
  // ==========================================
  const handleCapturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // يفتح كاميرا الهاتف مباشرة
    }
  };

  const handleRealPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    showToast("تم التقاط وإرفاق الصورة بنجاح.");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, audioNote: reader.result }));
          showToast("تم حفظ التسجيل الصوتي بنجاح.");
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      showToast("تعذر الوصول للمايكروفون. يرجى إعطاء الصلاحية للمتصفح.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteAudioNote = () => {
    setFormData(prev => ({ ...prev, audioNote: null }));
    showToast("تم حذف التسجيل الصوتي.");
  };

  // ==========================================
  // حفظ الاستمارة
  // ==========================================
  const handleFormSubmit = async () => {
    let signatureImg = "";
    if (canvasRef.current && hasSignature) {
      signatureImg = canvasRef.current.toDataURL();
    }

    const calculatedSev = calculateSeverity(formData);
    const newSurveyPayload = {
      engineerName: currentUser.name,
      ownerName: formData.ownerName || "غير محدد",
      ownerPhone: formData.ownerPhone || "غير معروف",
      ownerId: formData.ownerId || "غير مدخل",
      propertyType: formData.propertyType,
      gps: {
        lat: formData.gps.lat,
        lng: formData.gps.lng,
        address: formData.gps.address,
        locationUrl: formData.locationUrl || ""
      },
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      structural: {
        columns: formData.structural_columns,
        beams: formData.structural_beams,
        foundations: formData.structural_foundations
      },
      nonStructural: {
        walls: formData.nonStructural_walls,
        windows_alu_small: parseInt(formData.nonStructural_windows_alu_small) || 0,
        windows_alu_large: parseInt(formData.nonStructural_windows_alu_large) || 0,
        windows_steel: parseInt(formData.nonStructural_windows_steel) || 0,
        windows_facade: parseInt(formData.nonStructural_windows_facade) || 0,
        doors_wood: parseInt(formData.nonStructural_doors_wood) || 0,
        doors_iron: parseInt(formData.nonStructural_doors_iron) || 0
      },
      bathrooms: {
        status: formData.bathroom_status,
        count: parseInt(formData.bathroom_count) || 0
      },
      external: {
        fences: formData.external_fences,
        gates: formData.external_gates,
        annexes_detailed: {
          garage: {
            selected: formData.external_annex_garage_selected,
            area: parseInt(formData.external_annex_garage_area) || 0,
            damage: formData.external_annex_garage_damage
          },
          workroom: {
            selected: formData.external_annex_workroom_selected,
            area: parseInt(formData.external_annex_workroom_area) || 0,
            damage: formData.external_annex_workroom_damage
          },
          attic: {
            selected: formData.external_annex_attic_selected,
            area: parseInt(formData.external_annex_attic_area) || 0,
            damage: formData.external_annex_attic_damage
          },
          canopy: {
            selected: formData.external_annex_canopy_selected,
            area: parseInt(formData.external_annex_canopy_area) || 0,
            damage: formData.external_annex_canopy_damage
          }
        }
      },
      contents: {
        furniture_bedroom_count: parseInt(formData.furniture_bedroom_count) || 0,
        furniture_bedroom_damage: formData.furniture_bedroom_damage,
        furniture_beds_count: parseInt(formData.furniture_beds_count) || 0,
        furniture_beds_damage: formData.furniture_beds_damage,
        furniture_wardrobes_count: parseInt(formData.furniture_wardrobes_count) || 0,
        furniture_wardrobes_damage: formData.furniture_wardrobes_damage,
        furniture_sofa_count: parseInt(formData.furniture_sofa_count) || 0,
        furniture_sofa_damage: formData.furniture_sofa_damage,
        furniture_dining_count: parseInt(formData.furniture_dining_count) || 0,
        furniture_dining_damage: formData.furniture_dining_damage,
        furniture_carpet_count: parseInt(formData.furniture_carpet_count) || 0,
        furniture_carpet_damage: formData.furniture_carpet_damage,
        
        appliances_fridge: parseInt(formData.appliances_fridge) || 0,
        appliances_tv: parseInt(formData.appliances_tv) || 0,
        appliances_cooker: parseInt(formData.appliances_cooker) || 0,
        appliances_heater: parseInt(formData.appliances_heater) || 0,
        appliances_ac: parseInt(formData.appliances_ac) || 0,
        appliances_washing: parseInt(formData.appliances_washing) || 0
      },
      notes: formData.notes,
      audioNote: formData.audioNote,
      severity: calculatedSev,
      status: isOnline && db ? "بانتظار الاعتماد" : "مسودة (أوفلاين)",
      signature: signatureImg || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photos: formData.photos.length > 0 ? formData.photos : ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600"]
    };

    try {
      if (isOnline && db) {
        const surveysColRef = collection(db, 'surveys');
        await addDoc(surveysColRef, newSurveyPayload);
        showToast("تم رفع استمارة تقييم الأضرار أونلاين بنجاح إلى السحابة المركزية!");
      } else {
        const simulatedId = `DRAFT-2026-${Date.now()}`;
        setDrafts([{ id: simulatedId, ...newSurveyPayload }, ...drafts]);
        showToast("تم حفظ التقرير كمسودة في ذاكرة الهاتف لعدم وجود شبكة.");
      }
    } catch (e) {
      console.error("Error inserting document:", e);
      showToast("حدث خطأ أثناء الاتصال بالسيرفر السحابي.");
    }

    // إعادة تصفير معالج التسجيل
    setWizardStep(1);
    setFormData({
      ownerName: "",
      ownerPhone: "",
      ownerId: "",
      propertyType: "منزل مستقل",
      gps: { lat: 33.1102, lng: 35.4025, address: "عين إبل، جاري تحديد الموقع الميداني..." },
      locationUrl: "",
      structural_columns: "سليم",
      structural_beams: "سليم",
      structural_foundations: "سليم",
      nonStructural_walls: "سليم",
      nonStructural_windows_alu_small: 0,
      nonStructural_windows_alu_large: 0,
      nonStructural_windows_steel: 0,
      nonStructural_windows_facade: 0,
      nonStructural_doors_wood: 0,
      nonStructural_doors_iron: 0,
      bathroom_status: "سليم",
      bathroom_count: 0,
      external_fences: "سليمة",
      external_gates: "سليمة",
      
      external_annex_garage_selected: false,
      external_annex_garage_area: 0,
      external_annex_garage_damage: "سليم",

      external_annex_workroom_selected: false,
      external_annex_workroom_area: 0,
      external_annex_workroom_damage: "سليم",

      external_annex_attic_selected: false,
      external_annex_attic_area: 0,
      external_annex_attic_damage: "سليم",

      external_annex_canopy_selected: false,
      external_annex_canopy_area: 0,
      external_annex_canopy_damage: "سليم",
      
      furniture_bedroom_count: 0,
      furniture_bedroom_damage: "سليم",
      furniture_beds_count: 0,
      furniture_beds_damage: "سليم",
      furniture_wardrobes_count: 0,
      furniture_wardrobes_damage: "سليم",
      furniture_sofa_count: 0,
      furniture_sofa_damage: "سليم",
      furniture_dining_count: 0,
      furniture_dining_damage: "سليم",
      furniture_carpet_count: 0,
      furniture_carpet_damage: "سليم",
      
      appliances_fridge: 0,
      appliances_tv: 0,
      appliances_cooker: 0,
      appliances_heater: 0,
      appliances_ac: 0,
      appliances_washing: 0,
      notes: "",
      audioNote: null,
      photos: []
    });
    setHasSignature(false);
  };

  // مزامنة المسودات يدوياً
  const handleSyncDrafts = async () => {
    if (drafts.length === 0) {
      showToast("لا توجد مسودات محلية تحتاج للمزامنة.");
      return;
    }
    if(!db) {
        showToast("قاعدة البيانات غير متصلة.");
        return;
    }
    try {
      const surveysColRef = collection(db, 'surveys');
      for (const draft of drafts) {
        const { id, ...payload } = draft;
        payload.status = "بانتظار الاعتماد";
        await addDoc(surveysColRef, payload);
      }
      setDrafts([]);
      showToast("تمت مزامنة كافة التقارير الميدانية بنجاح مع السيرفر أونلاين!");
    } catch (e) {
      console.error("Sync failed:", e);
      showToast("فشلت عملية المزامنة السحابية.");
    }
  };

  // اعتماد القرارات الهندسية
  const handleApproveReport = async (id) => {
    if (!firebaseUser || !db) return;
    try {
      const docRef = doc(db, 'surveys', id);
      await updateDoc(docRef, { status: "معتمد" });
      if (selectedSurvey && selectedSurvey.id === id) {
        setSelectedSurvey({ ...selectedSurvey, status: "معتمد" });
      }
      showToast(`تم تحديث التقرير أونلاين واعتماده رسمياً للتعويض.`);
    } catch (e) {
      console.error("Error updating status:", e);
      showToast("فشل تحديث الحالة على السحابة.");
    }
  };

  const handleRejectReport = async (id) => {
    if (!firebaseUser || !db) return;
    try {
      const docRef = doc(db, 'surveys', id);
      await updateDoc(docRef, { status: "مرفوض - يتطلب إعادة مسح" });
      if (selectedSurvey && selectedSurvey.id === id) {
        setSelectedSurvey({ ...selectedSurvey, status: "مرفوض - يتطلب إعادة مسح" });
      }
      showToast(`تم الرفض والطلب من اللجنة الفنية إعادة معاينة العقار.`);
    } catch (e) {
      console.error("Error rejecting report:", e);
      showToast("فشل تحديث التقرير أونلاين.");
    }
  };

  // احتساب الإحصاءات
  const totalReportsCount = surveys.length;
  const pendingCount = surveys.filter(s => s.status === "بانتظار الاعتماد").length;
  const approvedCount = surveys.filter(s => s.status === "معتمد").length;
  const redSeverityCount = surveys.filter(s => s.severity === "جسيم / خطر").length;

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = 
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.engineerName && s.engineerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = severityFilter === "الكل" || s.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* التنبيهات */}
      {toastMessage && (
        <div className="fixed top-5 left-5 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 space-x-reverse border border-emerald-400">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* الشريط العلوي - بلدية عين إبل */}
      <header className="bg-emerald-900 text-emerald-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-white text-emerald-900 p-2 rounded-lg font-black tracking-wider flex items-center shadow-inner">
              <svg className="w-6 h-6 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>عين إبل</span>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold text-white">نظام مسح وحصر الأضرار - بلدية عين إبل</h1>
              <p className="text-xs text-emerald-200">النسخة السحابية الرسمية لفرق المهندسين</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse flex-wrap gap-2 text-xs md:text-sm">
            <button 
              onClick={() => {
                setIsOnline(!isOnline);
                showToast(isOnline ? "تم إطفاء الشبكة لمحاكاة الوضع الميداني المعزول." : "تم استعادة شبكة أونلاين! جاري الاتصال ومزامنة البيانات.");
              }}
              className={`px-3 py-1.5 rounded-full font-bold flex items-center transition-colors ${
                isOnline ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500" : "bg-red-900/80 text-red-200 border border-red-500"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ml-2 ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`}></span>
              {isOnline ? "أونلاين سحابي" : "أوفلاين محلي"}
            </button>

            {drafts.length > 0 && (
              <button 
                onClick={handleSyncDrafts}
                disabled={!isOnline}
                className={`px-3 py-1.5 rounded-full font-bold flex items-center transition-all ${
                  isOnline ? "bg-amber-500 text-slate-900 hover:bg-amber-400" : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                مزامنة المعلق ({drafts.length})
              </button>
            )}

            {currentUser && (
              <div className="bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-100 flex items-center">
                <span className="font-semibold text-white ml-1.5">{currentUser.name}</span>
                <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded mr-1.5">
                  {currentUser.role === "Supervisor" ? "مشرف" : "ميداني"}
                </span>
                <button 
                  onClick={handleLogout}
                  className="mr-3 text-red-300 hover:text-white transition-colors font-bold text-xs"
                >
                  خروج
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col justify-center">
        
        {!currentUser ? (
          // شاشة تسجيل الدخول
          <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-12">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 text-center text-white">
              <div className="bg-white text-emerald-900 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-md mb-3">
                ع
              </div>
              <h2 className="text-xl font-bold">بوابة بلدية عين إبل السحابية</h2>
              <p className="text-xs text-emerald-200 mt-1">تسجيل الدخول للجان حصر الأضرار والمهندسين المعتمدين</p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {authError && <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-3 rounded-lg text-xs">{authError}</div>}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم المستخدم</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">كلمة المرور</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg text-sm mt-2">
                دخول آمن
              </button>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mt-4 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">بيانات تجريبية سريعة:</p>
                <p>💡 المهندس: <span className="font-mono text-emerald-700 font-bold">engineer</span> / كلمة السر <span className="font-mono text-emerald-700 font-bold">123456</span></p>
                <p>💡 المشرف: <span className="font-mono text-emerald-700 font-bold">supervisor</span> / كلمة السر <span className="font-mono text-emerald-700 font-bold">admin</span></p>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
            
            {/* الشق الجانبي للتحكم */}
            <aside className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">الصفحة النشطة</span>
                <h3 className="font-bold text-slate-800 text-sm">{currentUser.name}</h3>
                <p className="text-xs text-slate-500">{currentUser.role === "Supervisor" ? "إدارة التقارير والتعويضات" : "مسح ميداني - عين إبل"}</p>
              </div>

              <nav className="space-y-1">
                {currentUser.role === "Field_Engineer" && (
                  <>
                    <button 
                      onClick={() => setCurrentTab("field-new")}
                      className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-bold text-xs transition-colors ${currentTab === "field-new" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span>استمارة مسح جديدة</span>
                    </button>
                    <button 
                      onClick={() => setCurrentTab("field-drafts")}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-colors ${currentTab === "field-drafts" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <span>المسودات الميدانية محلياً</span>
                      </div>
                      {drafts.length > 0 && <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{drafts.length}</span>}
                    </button>
                  </>
                )}

                {currentUser.role === "Supervisor" && (
                  <>
                    <button 
                      onClick={() => setCurrentTab("supervisor-dashboard")}
                      className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-bold text-xs transition-colors ${currentTab === "supervisor-dashboard" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span>لوحة تحكم البلدية للتقارير</span>
                    </button>
                    <button 
                      onClick={() => setCurrentTab("supervisor-users")}
                      className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-bold text-xs transition-colors ${currentTab === "supervisor-users" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="flex items-center"><span className="ml-2">👤</span>إدارة حسابات المهندسين</span>
                    </button>
                  </>
                )}
              </nav>

              {currentUser.role === "Supervisor" && (
                <div className="pt-2 border-t border-slate-100">
                  <button 
                    onClick={handleSeedDatabase}
                    className="w-full py-2 bg-emerald-900 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition-colors"
                  >
                    تهيئة استمارات عين إبل أونلاين
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1">يرفع استمارات نموذجية سحابياً لتجربة فورية</p>
                </div>
              )}
            </aside>

            {/* الجزء الرئيسي للاستمارات */}
            <section className="lg:col-span-9 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
              
              {/* شاشة تعبئة استمارة جديدة */}
              {currentUser.role === "Field_Engineer" && currentTab === "field-new" && (
                <div className="flex-1 flex flex-col">
                  
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 border-b-4 border-emerald-500">
                    <h2 className="text-lg font-bold">نموذج التقييم الفني - بلدية عين إبل</h2>
                    <p className="text-xs text-emerald-100 mt-1">يرجى تحري الدقة الكاملة. يتم توثيق التقرير بالإحداثيات الجنوبية والصور الحية والملاحظات الصوتية.</p>
                    
                    <div className="grid grid-cols-6 gap-2 mt-5 text-center text-[10px] md:text-xs">
                      {[
                        { step: 1, label: "المعلومات العامة" },
                        { step: 2, label: "الهيكل الإنشائي" },
                        { step: 3, label: "المعماري والفتحات" },
                        { step: 4, label: "الحمامات والأسوار" },
                        { step: 5, label: "الأثاث والأجهزة" },
                        { step: 6, label: "التوثيق الصوتي والبصري" }
                      ].map((item) => (
                        <div 
                          key={item.step} 
                          className={`pb-2 border-b-4 transition-all duration-300 ${wizardStep >= item.step ? "border-emerald-300 text-white font-bold" : "border-emerald-900 text-emerald-400/70"}`}
                        >
                          <span className="hidden md:inline">{item.label}</span>
                          <span className="md:hidden">خطوة {item.step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex-1 space-y-6">
                    {/* الخطوة 1 */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded text-xs text-slate-700">
                          يرجى التحقق من سجلات النفوس لمالك العقار وتسجيل بيانات الاتصال بدقة للجان التعويض.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">اسم صاحب العقار بالكامل</label>
                            <input 
                              type="text" 
                              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                              value={formData.ownerName}
                              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">رقم الهاتف النشط</label>
                            <input 
                              type="tel" 
                              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-left"
                              value={formData.ownerPhone}
                              onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">رقم السجل / قيد العائلة اللبناني</label>
                            <input 
                              type="text" 
                              placeholder="رقم السجل في النفوس"
                              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-left"
                              value={formData.ownerId}
                              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">نوع العقار المتضرر</label>
                            <select 
                              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                              value={formData.propertyType}
                              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                            >
                              <option value="منزل مستقل">منزل مستقل</option>
                              <option value="شقة سكنية">شقة سكنية</option>
                              <option value="مبنى تجاري">مبنى تجاري / محلات</option>
                              <option value="مؤسسة عامة / حكومية">مؤسسة عامة / حكومية</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4">
                          <h4 className="text-xs font-bold text-slate-700 flex items-center mb-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full ml-1.5 animate-pulse"></span>
                            التوقيع الجغرافي الميداني - نطاق عين إبل (GPS)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                            <div><strong>خط العرض:</strong> {formData.gps.lat}</div>
                            <div><strong>خط الطول:</strong> {formData.gps.lng}</div>
                            <div className="col-span-2 md:col-span-1"><strong>العنوان التقريبي:</strong> {formData.gps.address}</div>
                          </div>
                          <div className="space-y-1 mt-4">
                            <label className="text-xs font-bold text-slate-700 block flex items-center">
                              رابط الموقع من خرائط جوجل
                            </label>
                            <input 
                              type="url" 
                              placeholder="انسخ والصق رابط موقع العقار هنا"
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-left"
                              value={formData.locationUrl}
                              onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* الخطوة 2 */}
                    {wizardStep === 2 && (
                      <div className="space-y-6">
                        <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded text-xs text-red-800 font-semibold">
                          ⚠️ فحص السلامة الإنشائية يصنف المبنى (جسيم / خطر) فوراً.
                        </div>
                        {/* الأعمدة */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">أ. الأعمدة والجدران الاستنادية الحاملة</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { val: "سليم", desc: "لا توجد أضرار ظاهرة" },
                              { val: "تشققات شعرية سطحيّة", desc: "شروخ في اللياسة الخارجية" },
                              { val: "تصدعات عميقة", desc: "تشققات نافذة عميقة تتطلب تدعيماً" },
                              { val: "انقشاع الخرسانة (Spalling)", desc: "سقوط الخرسانة وظهور حديد التسليح" },
                              { val: "انبعاج حديد التسليح (Buckling)", desc: "التواء قضبان الحديد نتيجة ضغط الانفجار" },
                              { val: "فشل كلي/انهيار", desc: "تهشم كامل للجدران والأعمدة" }
                            ].map((opt) => (
                              <label key={opt.val} className={`p-3 rounded-xl border flex items-start space-x-3 space-x-reverse cursor-pointer transition-all ${formData.structural_columns === opt.val ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="structural_columns" className="mt-1 text-emerald-600 focus:ring-emerald-500" checked={formData.structural_columns === opt.val} onChange={() => setFormData({ ...formData, structural_columns: opt.val })} />
                                <div><span className="text-xs font-bold text-slate-800 block">{opt.val}</span><span className="text-[10px] text-slate-500">{opt.desc}</span></div>
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* الجسور */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">ب. الجسور والأسقف الخرسانية</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { val: "سليم", desc: "لا توجد أضرار" },
                              { val: "تشققات عرضية/طولية", desc: "شروخ في منتصف أو أطراف الجسور" },
                              { val: "ترخيم ملحوظ (Deflection)", desc: "هبوط مرئي بوضوح في منتصف البلاطة" },
                              { val: "انفصال الغطاء الخرساني", desc: "سقوط الطبقة السفلية وظهور شبكة الحديد" },
                              { val: "اختراق كامل (Punching)", desc: "اختراق السقف بشكل نافذ بفعل قذيفة/شظية" },
                              { val: "انهيار جزئي/كلي لبلاد السقف", desc: "سقوط أجزاء كبيرة من السقف" }
                            ].map((opt) => (
                              <label key={opt.val} className={`p-3 rounded-xl border flex items-start space-x-3 space-x-reverse cursor-pointer transition-all ${formData.structural_beams === opt.val ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="structural_beams" className="mt-1 text-emerald-600" checked={formData.structural_beams === opt.val} onChange={() => setFormData({ ...formData, structural_beams: opt.val })} />
                                <div><span className="text-xs font-bold text-slate-800 block">{opt.val}</span><span className="text-[10px] text-slate-500">{opt.desc}</span></div>
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* الأساسات */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">ج. أساسات وقواعد المبنى</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {[
                              { val: "سليم", desc: "لا توجد شروخ أرضية" },
                              { val: "تصدع في الأساسات", desc: "تشققات بالهيكل تحت الأرض" },
                              { val: "هبوط تفاضلي (Settlement)", desc: "ميلان في المبنى أو هبوط بالأرضية" }
                            ].map((opt) => (
                              <label key={opt.val} className={`p-3 rounded-xl border flex items-start space-x-2 space-x-reverse cursor-pointer transition-all ${formData.structural_foundations === opt.val ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="structural_foundations" className="mt-1 text-emerald-600" checked={formData.structural_foundations === opt.val} onChange={() => setFormData({ ...formData, structural_foundations: opt.val })} />
                                <div><span className="text-xs font-bold text-slate-800 block">{opt.val}</span><span className="text-[10px] text-slate-500">{opt.desc}</span></div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* الخطوة 3 */}
                    {wizardStep === 3 && (
                      <div className="space-y-6">
                        {/* الجدران */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">أ. جدران وقواطع الطوب (غير الحاملة)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { val: "سليم", desc: "الجدران سليمة تماماً" },
                              { val: "تشققات عند الفواصل", desc: "فواصل التمدد والتقاء البلوك بالخرسانة" },
                              { val: "تشققات مائلة (X-Cracks)", desc: "تشققات مائلة تدل على إجهاد القص جراء العصف" },
                              { val: "انهيار جزئي", desc: "سقوط أجزاء أو قواطع محددة داخل الغرف" },
                              { val: "انهيار كامل للجدار", desc: "سقوط أو اقتلاع الجدار الخارجي/الداخلي تماماً" }
                            ].map((opt) => (
                              <label key={opt.val} className={`p-3 rounded-xl border flex items-start space-x-3 space-x-reverse cursor-pointer transition-all ${formData.nonStructural_walls === opt.val ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="nonStructural_walls" className="mt-1 text-emerald-600" checked={formData.nonStructural_walls === opt.val} onChange={() => setFormData({ ...formData, nonStructural_walls: opt.val })} />
                                <div><span className="text-xs font-bold text-slate-800 block">{opt.val}</span><span className="text-[10px] text-slate-500">{opt.desc}</span></div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* النوافذ */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-3">ب. جرد النوافذ المتضررة</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">شباك ألومنيوم صغير</span><span className="text-[9px] text-slate-400">{"مساحة أقل من $1.5\\text{ م}^2$"}</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_alu_small: Math.max(0, p.nonStructural_windows_alu_small - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_windows_alu_small}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_alu_small: p.nonStructural_windows_alu_small + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">شباك ألومنيوم كبير</span><span className="text-[9px] text-slate-400">{"مساحة أكبر من $1.5\\text{ م}^2$"}</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_alu_large: Math.max(0, p.nonStructural_windows_alu_large - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_windows_alu_large}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_alu_large: p.nonStructural_windows_alu_large + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">شبابيك حديد وحماية</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_steel: Math.max(0, p.nonStructural_windows_steel - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_windows_steel}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_steel: p.nonStructural_windows_steel + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">واجهات زجاجية رئيسية</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_facade: Math.max(0, p.nonStructural_windows_facade - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_windows_facade}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_windows_facade: p.nonStructural_windows_facade + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* الأبواب */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-3">ج. جرد الأبواب المتضررة</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">أبواب خشبية داخلية</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_doors_wood: Math.max(0, p.nonStructural_doors_wood - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_doors_wood}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_doors_wood: p.nonStructural_doors_wood + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div><span className="text-xs font-bold text-slate-700 block">أبواب حديد مصفحة خارجية</span></div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_doors_iron: Math.max(0, p.nonStructural_doors_iron - 1) }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">-</button>
                                <span className="w-8 text-center font-bold text-xs">{formData.nonStructural_doors_iron}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, nonStructural_doors_iron: p.nonStructural_doors_iron + 1 }))} className="w-8 h-8 bg-slate-100 rounded-lg hover:bg-slate-200 font-extrabold">+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* الخطوة 4: الحمامات والملاحق */}
                    {wizardStep === 4 && (
                      <div className="space-y-6">
                        {/* الحمامات */}
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-300">
                          <h4 className="text-xs font-bold text-emerald-800 mb-3">بند مستقل: تقييم أضرار الحمامات</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                              <label className="text-xs font-bold text-slate-700 block">عدد الحمامات المتضررة بالعقار</label>
                              <div className="flex items-center space-x-2 space-x-reverse mt-1">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, bathroom_count: Math.max(0, p.bathroom_count - 1) }))} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 font-bold">-</button>
                                <span className="w-10 text-center font-bold text-xs">{formData.bathroom_count}</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, bathroom_count: p.bathroom_count + 1 }))} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 font-bold">+</button>
                                <span className="text-xs text-slate-500 mr-2">حمام</span>
                              </div>
                            </div>
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                              <label className="text-xs font-bold text-slate-700 block">مستوى ضرر الأطقم والتمديدات</label>
                              <select className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs mt-1 outline-none" value={formData.bathroom_status} onChange={(e) => setFormData({ ...formData, bathroom_status: e.target.value })}>
                                <option value="سليم">سليم - لا توجد أضرار</option>
                                <option value="تضرر سطحي (سيراميك/إكسسوارات)">تضرر سطحي (سيراميك)</option>
                                <option value="تدمير جزئي (أطقم صحية/مغاسل)">تدمير جزئي (أطقم صحية/مغاسل)</option>
                                <option value="تدمير كلي وتفجر التمديدات الصحية">تدمير كامل وتفجر تمديدات المياه</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* الملاحق */}
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-700 block mb-2">ج. جرد الملاحق الخارجية المتضررة</label>
                          <div className="grid grid-cols-1 gap-3">
                            {ANNEX_TYPES.map((item) => {
                              const isSelected = formData[`external_annex_${item.id}_selected`];
                              return (
                                <div key={item.id} className={`p-3 rounded-xl border transition-all ${isSelected ? "border-emerald-500 bg-white shadow-sm" : "border-slate-200 bg-white"}`}>
                                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer font-bold text-xs text-slate-800">
                                    <input type="checkbox" className="rounded text-emerald-600 w-4 h-4 ml-2" checked={isSelected} onChange={(e) => setFormData({ ...formData, [`external_annex_${item.id}_selected`]: e.target.checked })} />
                                    <span>{item.icon} {item.label}</span>
                                  </label>
                                  {isSelected && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-dashed border-slate-200">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 block">المساحة (بـ م²)</label>
                                        <input type="number" className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" value={formData[`external_annex_${item.id}_area`] || ""} onChange={(e) => setFormData({ ...formData, [`external_annex_${item.id}_area`]: parseInt(e.target.value) || 0 })} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 block">نوع الخراب</label>
                                        <select className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" value={formData[`external_annex_${item.id}_damage`]} onChange={(e) => setFormData({ ...formData, [`external_annex_${item.id}_damage`]: e.target.value })}>
                                          <option value="سليم">سليم</option>
                                          <option value="تشققات شعرية سطحيّة">تشققات شعرية</option>
                                          <option value="تصدع وشروخ عميقة">تصدع عميق</option>
                                          <option value="انهيار جزئي">انهيار جزئي</option>
                                          <option value="تفتت بالكامل وتفحم القرميد">دمار وتفحم القرميد</option>
                                          <option value="انهيار كلي">انهيار كلي</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* الأسوار */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">د. الأسوار الخارجية للمبنى</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { val: "سليمة", desc: "لا توجد أضرار في السور" },
                              { val: "أضرار سطحية", desc: "آثار شظايا بسيطة" },
                              { val: "تصدع وشروخ خطيرة", desc: "ميول وتصدع خطير" },
                              { val: "انهيار جزئي", desc: "سقوط أجزاء من السور" },
                              { val: "انهيار كلي", desc: "دمار شامل للسور" }
                            ].map((opt) => (
                              <label key={opt.val} className={`p-3 rounded-xl border flex items-start space-x-3 space-x-reverse cursor-pointer ${formData.external_fences === opt.val ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
                                <input type="radio" name="external_fences" className="mt-1" checked={formData.external_fences === opt.val} onChange={() => setFormData({ ...formData, external_fences: opt.val })} />
                                <div><span className="text-xs font-bold block">{opt.val}</span></div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* الخطوة 5: الأثاث */}
                    {wizardStep === 5 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">أ. جرد العفش الداخلي (العدد + الخراب)</label>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                            {[
                              { key: "bedroom", label: "غرف نوم كاملة" },
                              { key: "beds", label: "أسرة منفردة" },
                              { key: "wardrobes", label: "خزائن منفصلة" },
                              { key: "sofa", label: "أطقم صالونات" },
                              { key: "dining", label: "طاولات سفرة" },
                              { key: "carpet", label: "سجاد وموكيت" }
                            ].map((item) => (
                              <div key={item.key} className="p-3 bg-white rounded-xl border flex flex-col md:flex-row justify-between gap-3 shadow-sm">
                                <div className="md:w-1/3 text-xs font-bold">{item.label}</div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <button type="button" onClick={() => setFormData(p => ({ ...p, [`furniture_${item.key}_count`]: Math.max(0, p[`furniture_${item.key}_count`] - 1) }))} className="w-8 h-8 bg-slate-100 rounded font-extrabold">-</button>
                                  <span className="w-8 text-center font-bold text-xs">{formData[`furniture_${item.key}_count`]}</span>
                                  <button type="button" onClick={() => setFormData(p => ({ ...p, [`furniture_${item.key}_count`]: p[`furniture_${item.key}_count`] + 1 }))} className="w-8 h-8 bg-slate-100 rounded font-extrabold">+</button>
                                </div>
                                <div className="flex-1">
                                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-xs" value={formData[`furniture_${item.key}_damage`]} onChange={(e) => setFormData({ ...formData, [`furniture_${item.key}_damage`]: e.target.value })}>
                                    {DAMAGE_TYPES.map((dmg, idx) => <option key={idx} value={dmg}>{dmg}</option>)}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-3">ب. جرد الأجهزة الكهربائية بالتعداد</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['fridge', 'tv', 'cooker', 'heater', 'ac', 'washing'].map((key) => {
                              const labels = {fridge: 'براد', tv: 'تلفزيون', cooker: 'فرن غاز', heater: 'مدفأة', ac: 'مكيف', washing: 'غسالة'};
                              return (
                                <div key={key} className="flex flex-col p-2.5 bg-white rounded-xl border">
                                  <span className="text-[11px] font-bold text-slate-600 block mb-1">{labels[key]}</span>
                                  <div className="flex justify-between items-center">
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, [`appliances_${key}`]: Math.max(0, p[`appliances_${key}`] - 1) }))} className="w-7 h-7 bg-slate-100 rounded font-extrabold">-</button>
                                    <span className="font-bold text-xs">{formData[`appliances_${key}`]}</span>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, [`appliances_${key}`]: p[`appliances_${key}`] + 1 }))} className="w-7 h-7 bg-slate-100 rounded font-extrabold">+</button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* الخطوة 6: الكاميرا والصوت */}
                    {wizardStep === 6 && (
                      <div className="space-y-6">
                        
                        {/* كاميرا الفحص الحقيقية */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">التوثيق البصري المباشر (كاميرا الهاتف)</label>
                          <div className="flex flex-wrap gap-4 items-center">
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              ref={fileInputRef}
                              onChange={handleRealPhotoUpload}
                              className="hidden" 
                            />
                            <button 
                              type="button"
                              onClick={handleCapturePhoto}
                              className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center shadow-lg transition-all"
                            >
                              <span className="text-lg ml-2">📷</span>
                              فتح الكاميرا والتقاط صورة الآن
                            </button>
                          </div>

                          {formData.photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                              {formData.photos.map((ph, idx) => (
                                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm aspect-video group">
                                  <img src={ph} alt="damage capture" className="w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-[8px] text-white p-2 leading-relaxed">
                                    <p className="font-bold">📍 {formData.gps.lat}, {formData.gps.lng}</p>
                                  </div>
                                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 text-[10px]">حذف</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ملاحظات والتسجيل الصوتي المباشر */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-700 block">ملاحظات هندسية وتوصيات البلدية (نصية وصوتية)</label>
                          <textarea 
                            rows="2" 
                            placeholder="اكتب التوصيات الفنية للبلدية والترميم..."
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          />
                          
                          <div className="flex items-center space-x-3 space-x-reverse pt-2 border-t border-slate-200/60">
                            {!formData.audioNote ? (
                              <button 
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                  isRecording ? "bg-red-100 text-red-700 border border-red-300 animate-pulse" : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                }`}
                              >
                                {isRecording ? (
                                  <><span className="w-2 h-2 rounded-full bg-red-600 ml-2"></span>جاري التسجيل... للإيقاف</>
                                ) : (
                                  <><span className="text-base ml-1.5">🎙️</span>تسجيل ملاحظة صوتية مباشرة</>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center w-full bg-white p-2 rounded-xl border border-slate-200 gap-3">
                                <span className="text-emerald-600 text-lg">🎧</span>
                                <audio src={formData.audioNote} controls className="h-8 w-full max-w-[200px]" />
                                <button type="button" onClick={deleteAudioNote} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold mr-auto">حذف</button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* التوقيع الإلكتروني */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-700 block">توقيع المهندس الفاحص رقمياً</label>
                            <button type="button" onClick={clearCanvas} className="text-[10px] text-red-600 hover:underline font-bold">إعادة التوقيع</button>
                          </div>
                          <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                            <canvas ref={canvasRef} width={400} height={150} className="w-full cursor-crosshair h-32 touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* أزرار التحكم بالسيرفر */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                    <button type="button" disabled={wizardStep === 1} onClick={() => setWizardStep(prev => prev - 1)} className={`px-4 py-2 rounded-lg font-bold text-xs ${wizardStep === 1 ? "text-slate-300" : "bg-slate-200 text-slate-700"}`}>السابق</button>
                    <div className="text-xs text-slate-500 font-bold">خطوة {wizardStep} من 6</div>
                    {wizardStep < 6 ? (
                      <button type="button" onClick={() => setWizardStep(prev => prev + 1)} className="bg-emerald-900 text-white px-5 py-2 rounded-lg font-bold text-xs">التالي</button>
                    ) : (
                      <button type="button" onClick={handleFormSubmit} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-lg">
                        {isOnline ? "رفع أونلاين للسيرفر" : "حفظ كمسودة بالهاتف"}
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* شاشة المسودات */}
              {currentUser.role === "Field_Engineer" && currentTab === "field-drafts" && (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">المسودات المحفوظة محلياً (أوفلاين)</h2>
                    </div>
                    {drafts.length > 0 && <button onClick={handleSyncDrafts} disabled={!isOnline} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold">مزامنة أونلاين</button>}
                  </div>
                  {drafts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-sm font-bold">لا توجد مسودات معلقة بالهاتف</div>
                  ) : (
                    <div className="space-y-3">
                      {drafts.map((d) => (
                        <div key={d.id} className="p-4 rounded-xl border bg-slate-50 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400">{d.id}</span>
                            <h4 className="text-sm font-bold">{d.ownerName}</h4>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* لوحة المشرف */}
              {currentUser.role === "Supervisor" && currentTab === "supervisor-dashboard" && (
                <div className="flex-1 flex flex-col">
                  <div className="bg-emerald-900 text-white p-6">
                    <h2 className="text-lg font-bold">لجنة بلدية عين إبل - إدارة التقارير</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-emerald-800 p-4 rounded-xl border border-emerald-700"><span className="text-[10px] text-emerald-200">إجمالي التقارير</span><h3 className="text-2xl font-black">{totalReportsCount}</h3></div>
                      <div className="bg-emerald-800 p-4 rounded-xl border border-emerald-700"><span className="text-[10px] text-amber-300">بانتظار الاعتماد</span><h3 className="text-2xl font-black text-amber-400">{pendingCount}</h3></div>
                      <div className="bg-emerald-800 p-4 rounded-xl border border-emerald-700"><span className="text-[10px] text-red-300">المباني المهددة بالخطر</span><h3 className="text-2xl font-black text-red-400">{redSeverityCount}</h3></div>
                      <div className="bg-emerald-800 p-4 rounded-xl border border-emerald-700"><span className="text-[10px] text-emerald-200">نسبة الاعتماد</span><h3 className="text-2xl font-black">{totalReportsCount > 0 ? `${Math.round((approvedCount / totalReportsCount) * 100)}%` : "0%"}</h3></div>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
                    <div className="xl:col-span-4 space-y-4 flex flex-col">
                      <input type="text" placeholder="ابحث باسم المالك أو المهندس..." className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      <div className="flex space-x-2 space-x-reverse text-[10px] font-bold flex-wrap gap-y-2">
                        {["الكل", "جسيم / خطر", "متوسط", "خفيف"].map((f) => (
                          <button key={f} onClick={() => setSeverityFilter(f)} className={`px-2.5 py-1.5 rounded-lg ${severityFilter === f ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-600"}`}>{f}</button>
                        ))}
                      </div>
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px]">
                        {filteredSurveys.map((s) => (
                          <div key={s.id} onClick={() => setSelectedSurvey(s)} className={`p-3 rounded-xl border cursor-pointer ${selectedSurvey && selectedSurvey.id === s.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
                            <div className="flex justify-between items-start"><span className="text-[10px] text-slate-400 font-bold">{s.id.substring(0, 8)}</span><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.severity === "جسيم / خطر" ? "bg-red-100 text-red-700" : s.severity === "متوسط" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{s.severity}</span></div>
                            <h4 className="text-xs font-bold mt-1">{s.ownerName}</h4>
                            <p className="text-[10px] text-slate-500">{s.engineerName} | {s.timestamp.substring(0,10)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="xl:col-span-8 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      {selectedSurvey ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
                            <h4 className="text-xs font-bold text-slate-800">حالة التقرير: {selectedSurvey.status}</h4>
                            <div className="flex space-x-2 space-x-reverse">
                              <button onClick={() => handleApproveReport(selectedSurvey.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">اعتماد التقرير</button>
                              <button onClick={() => handleRejectReport(selectedSurvey.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">رفض التقرير</button>
                            </div>
                          </div>

                          <div id="printable-report" className="bg-white p-6 rounded-2xl shadow border space-y-4 text-xs font-sans">
                            <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-100 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-800 font-black text-xs text-center leading-tight">بلدية<br/>عين إبل</div>
                                <div>
                                  <h3 className="font-extrabold text-sm text-emerald-900">لجنة مسح وحصر الأضرار</h3>
                                  <p className="text-[9px] text-slate-500">بلدية عين إبل - قضاء بنت جبيل</p>
                                </div>
                              </div>
                              <div className="text-left">
                                <h4 className="font-black text-slate-900 text-sm">استمارة أضرار رسمية</h4>
                                <p className="text-[9px] text-slate-400">الرقم: {selectedSurvey.id.substring(0, 10)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border text-[11px]">
                              <div><strong>صاحب العقار:</strong> {selectedSurvey.ownerName}</div>
                              <div><strong>رقم الهاتف:</strong> {selectedSurvey.ownerPhone}</div>
                              <div><strong>رقم السجل/القيد:</strong> {selectedSurvey.ownerId}</div>
                              <div><strong>نوع العقار:</strong> {selectedSurvey.propertyType}</div>
                              <div><strong>التاريخ:</strong> {selectedSurvey.timestamp}</div>
                              <div><strong>المهندس:</strong> {selectedSurvey.engineerName}</div>
                              <div className="col-span-2 flex justify-between items-center border-t border-slate-200/50 pt-2">
                                <div><strong>الموقع (عين إبل):</strong> {selectedSurvey.gps.lat}, {selectedSurvey.gps.lng}</div>
                                {selectedSurvey.gps.locationUrl && (
                                  <a href={selectedSurvey.gps.locationUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-bold text-[9px]">🌐 خرائط جوجل</a>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">1. السلامة الإنشائية للهيكل</h4>
                              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2 rounded">
                                <div><strong>الأعمدة الجدران:</strong> {selectedSurvey.structural.columns}</div>
                                <div><strong>الأسقف الجسور:</strong> {selectedSurvey.structural.beams}</div>
                                <div><strong>الأساسات:</strong> {selectedSurvey.structural.foundations}</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">2. الأضرار المعمارية والفتحات</h4>
                              <div className="bg-slate-50 p-3 rounded-lg text-[10px]">
                                <div><strong>جدران الطوب:</strong> {selectedSurvey.nonStructural.walls}</div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-2 mt-2 text-[9.5px]">
                                  <div>
                                    <strong className="text-emerald-800 block mb-1">الشبابيك:</strong>
                                    <ul className="list-disc list-inside">
                                      <li>ألمنيوم صغير: {selectedSurvey.nonStructural.windows_alu_small ?? 0}</li>
                                      <li>ألمنيوم كبير: {selectedSurvey.nonStructural.windows_alu_large ?? 0}</li>
                                      <li>شبابيك حديد: {selectedSurvey.nonStructural.windows_steel ?? 0}</li>
                                      <li>واجهات زجاجية: {selectedSurvey.nonStructural.windows_facade ?? 0}</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-emerald-800 block mb-1">الأبواب:</strong>
                                    <ul className="list-disc list-inside">
                                      <li>أبواب خشبية: {selectedSurvey.nonStructural.doors_wood ?? 0}</li>
                                      <li>أبواب حديد: {selectedSurvey.nonStructural.doors_iron ?? 0}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">3. الحمامات والشبكة الصحية</h4>
                              <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg text-[10px] grid grid-cols-2">
                                <div><strong>الحمامات المتضررة:</strong> {selectedSurvey.bathrooms?.count ?? 0} حمام</div>
                                <div><strong>الأطقم والتمديدات:</strong> {selectedSurvey.bathrooms?.status ?? "سليم"}</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">4. كشف الأثاث والمحتويات الداخلي</h4>
                              <table className="w-full text-right text-[10px] border">
                                <thead className="bg-slate-100">
                                  <tr><th className="p-2">الصنف</th><th className="p-2 text-center">العدد</th><th className="p-2">نوع الخراب</th></tr>
                                </thead>
                                <tbody>
                                  {[
                                    { label: "غرف نوم رئيسية", key: "bedroom" },
                                    { label: "أسرة منفردة", key: "beds" },
                                    { label: "خزائن ملابس", key: "wardrobes" },
                                    { label: "صالونات وكنب", key: "sofa" },
                                    { label: "طاولات سفرة", key: "dining" },
                                    { label: "سجاد وموكيت", key: "carpet" }
                                  ].map((item, idx) => {
                                    const count = selectedSurvey.contents[`furniture_${item.key}_count`] ?? 0;
                                    const damage = selectedSurvey.contents[`furniture_${item.key}_damage`] ?? "سليم";
                                    return (
                                      <tr key={idx} className="border-b">
                                        <td className="p-1.5">{item.label}</td><td className="p-1.5 text-center font-bold">{count}</td><td className="p-1.5">{count>0?damage:"-"}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">5. الأجهزة الكهربائية</h4>
                              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg">
                                <div>براد: <span className="font-bold">{selectedSurvey.contents.appliances_fridge??0}</span></div>
                                <div>تلفزيون: <span className="font-bold">{selectedSurvey.contents.appliances_tv??0}</span></div>
                                <div>فرن/غاز: <span className="font-bold">{selectedSurvey.contents.appliances_cooker??0}</span></div>
                                <div>مدفأة: <span className="font-bold">{selectedSurvey.contents.appliances_heater??0}</span></div>
                                <div>مكيف: <span className="font-bold">{selectedSurvey.contents.appliances_ac??0}</span></div>
                                <div>غسالة: <span className="font-bold">{selectedSurvey.contents.appliances_washing??0}</span></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-r-2 border-emerald-500 pr-1.5">6. الملاحق والأسوار الخارجية</h4>
                              <div className="bg-slate-50 p-2.5 rounded border text-[10px] grid grid-cols-2 gap-4">
                                <div>
                                  <strong>الأسوار والبوابات:</strong>
                                  <div>سور المبنى: {selectedSurvey.external.fences}</div>
                                  <div>البوابات: {selectedSurvey.external.gates}</div>
                                </div>
                                <div>
                                  <strong>الملاحق:</strong>
                                  {selectedSurvey.external.annexes_detailed ? (
                                    Object.entries(selectedSurvey.external.annexes_detailed).filter(([_,v])=>v.selected).map(([k,v]) => (
                                      <div key={k} className="mt-1">
                                        <span className="font-bold">{k==='garage'?"كراج":k==='workroom'?"غرفة عمل":k==='attic'?"سقيفة":"قرميد"} ({v.area}م²)</span>: {v.damage}
                                      </div>
                                    ))
                                  ) : "لا يوجد"}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border">
                              <strong className="text-[10px] text-slate-500 block">التوصيات والملاحظات:</strong>
                              <p className="text-[10.5px] text-slate-700">{selectedSurvey.notes || "لا يوجد"}</p>
                              {selectedSurvey.audioNote && (
                                <div className="mt-2 pt-2 border-t flex items-center gap-2">
                                  <strong className="text-[10px] text-emerald-700">🎙️ تسجيل صوتي:</strong>
                                  <audio src={selectedSurvey.audioNote} controls className="h-6 w-[200px]" />
                                </div>
                              )}
                            </div>

                            {selectedSurvey.photos && selectedSurvey.photos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                {selectedSurvey.photos.map((ph, idx) => (
                                  <img key={idx} src={ph} className="rounded border aspect-video object-cover w-full" />
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed items-end text-center mt-6">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold block">توقيع المهندس الفاحص</span>
                                <img src={selectedSurvey.signature} className="h-10 mx-auto" />
                                <span className="text-[10px] font-bold">{selectedSurvey.engineerName}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold block mb-2">مصادقة بلدية عين إبل</span>
                                {selectedSurvey.status === "معتمد" ? (
                                  <div className="border border-emerald-500 text-emerald-700 font-bold text-[10px] py-2 bg-emerald-50 rounded mx-auto">✓ معتمد رسمياً للتعويض</div>
                                ) : (
                                  <div className="border border-amber-300 text-amber-700 font-bold text-[10px] py-2 bg-amber-50 rounded mx-auto">قيد المراجعة الفنية</div>
                                )}
                              </div>
                            </div>

                          </div>
                          
                          <button onClick={() => window.print()} className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold w-full md:w-auto">طباعة / تصدير PDF</button>
                        </div>
                      ) : (
                        <div className="text-center py-24 text-slate-400 text-sm">الرجاء اختيار استمارة من القائمة لاستعراضها</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* شاشة إدارة الحسابات */}
              {currentUser.role === "Supervisor" && currentTab === "supervisor-users" && (
                <div className="p-6 flex-1 flex flex-col space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">إدارة حسابات المهندسين - بلدية عين إبل</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border">
                      <h3 className="text-sm font-bold mb-4">إنشاء حساب مهندس جديد</h3>
                      <form onSubmit={handleCreateNewUser} className="space-y-4">
                        <input type="text" placeholder="الاسم الكامل" className="w-full p-2.5 rounded-xl border text-xs" value={newEngineerForm.name} onChange={e => setNewEngineerForm({...newEngineerForm, name: e.target.value})} required/>
                        <input type="text" placeholder="اسم المستخدم (Username)" className="w-full p-2.5 rounded-xl border text-xs text-left" value={newEngineerForm.username} onChange={e => setNewEngineerForm({...newEngineerForm, username: e.target.value})} required/>
                        <input type="text" placeholder="كلمة المرور" className="w-full p-2.5 rounded-xl border text-xs text-left" value={newEngineerForm.password} onChange={e => setNewEngineerForm({...newEngineerForm, password: e.target.value})} required/>
                        <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold">إنشاء الحساب</button>
                      </form>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-bold">الحسابات النشطة ({usersList.length})</h3>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {usersList.map(user => (
                          <div key={user.id} className="p-3 bg-white border rounded-xl flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold">{user.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">{user.username}</p>
                            </div>
                            <button onClick={() => setEditingUser({id: user.id, name: user.name, username: user.username, newPassword: ""})} className="text-[10px] bg-slate-100 px-3 py-1 rounded border font-bold">تغيير كلمة المرور</button>
                          </div>
                        ))}
                      </div>
                      
                      {editingUser && (
                        <form onSubmit={handleUpdatePassword} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mt-4">
                          <div className="flex justify-between"><span className="text-xs font-bold">تغيير كلمة المرور لـ {editingUser.name}</span><button type="button" onClick={()=>setEditingUser(null)} className="text-red-500 text-xs">إلغاء</button></div>
                          <input type="text" placeholder="كلمة المرور الجديدة" className="w-full p-2 rounded border text-xs" value={editingUser.newPassword} onChange={e=>setEditingUser({...editingUser, newPassword:e.target.value})} required/>
                          <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded text-xs font-bold">حفظ</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </section>
          </div>
        )}
      </main>
    </div>
  );
}
