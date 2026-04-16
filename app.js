const { useState, useEffect, useMemo, useRef } = React;

/* ── Firebase 설정 (compat 방식) ── */
const firebaseConfig = {
  apiKey: "AIzaSyCB9BxM7Qc580FuWDHj3iAlrFNi5iBy0Po",
  authDomain: "archive-b031f.firebaseapp.com",
  projectId: "archive-b031f",
  storageBucket: "archive-b031f.firebasestorage.app",
  messagingSenderId: "616679717444",
  appId: "1:616679717444:web:446bc7d3dcb956c06c5a11",
  measurementId: "G-YWVC1RSP5L"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth     = firebase.auth();
const db       = firebase.firestore();
const storage  = firebase.storage();
const provider = new firebase.auth.GoogleAuthProvider();

/* ── Design System ── */
const ACCENT       = "#2EE622";
const ACCENT_LIGHT = "#e8fde8";
const BORDER       = "#c8d4ee";
const BG_MAIN      = "#f4f6fb";
const BG_DARK      = "#3D3FD9";
const TEXT_MAIN    = "#1a1f3c";

const globalStyle = `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard', sans-serif; background: #f4f6fb; color: #1a1f3c; -webkit-font-smoothing: antialiased; }
    .scroll-container::-webkit-scrollbar { width: 3px; }
    .scroll-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
    
    header { border-bottom: 1px solid ${BORDER}; position: sticky; top: 0; z-index: 100; background: #fff; }
    .grid-layout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 20px; }
    .grid-card { cursor: pointer; text-align: center; }
    .grid-img { width: 100%; aspect-ratio: 1/1; border-radius: 12px; object-fit: cover; border: 1px solid ${BORDER}; background: #e8ecf8; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; }
    .modal-content { background: #fff; width: 100%; max-width: 600px; margin: 0 auto; border-top-left-radius: 25px; border-top-right-radius: 25px; max-height: 94vh; overflow-y: auto; padding: 25px; }
    
    .section-label { font-size: 10px; color: #999; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .concept-card { padding: 20px; border: 1px solid ${BORDER}; border-radius: 12px; margin: 0 20px 10px; cursor: pointer; }
    .accordion { margin-top: 15px; background: #eef1fa; padding: 20px; border-radius: 15px; line-height: 1.7; white-space: pre-wrap; font-size: 14px; }

    .search-container { padding: 15px 20px; background: #fff; border-bottom: 1px solid ${BORDER}; }
    .search-input { width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid ${BORDER}; background: #eef1fa; outline: none; font-size: 14px; transition: all 0.2s; }
    .search-input:focus { border-color: ${BG_DARK}; background: #fff; }
    .search-results { padding: 10px 20px; background: #fff; position: absolute; width: 100%; max-width: 720px; z-index: 90; box-shadow: 0 10px 20px rgba(61,63,217,0.10); }
    .search-item { padding: 12px 0; border-bottom: 1px solid #e0e8f8; cursor: pointer; }
    .search-tag { display: inline-block; font-size: 9px; padding: 2px 6px; border-radius: 4px; background: #e8ebfa; color: ${BG_DARK}; font-weight: 700; margin-right: 8px; vertical-align: middle; }

    .hashtag-link { color: ${BG_DARK}; font-weight: 700; cursor: pointer; margin-right: 8px; text-decoration: none; }
    .hashtag-link:hover { text-decoration: underline; }
    .hashtag-group-title { font-size: 12px; font-weight: 800; color: #333; margin: 25px 0 10px; padding-left: 10px; border-left: 3px solid ${BG_DARK}; }

    /* 로그인 화면 */
    .login-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 40px 20px; background: #3D3FD9; }
    .login-btn { display: flex; align-items: center; gap: 12px; padding: 14px 28px; border: none; border-radius: 12px; background: #2EE622; font-size: 15px; font-weight: 700; cursor: pointer; color: #1a1f3c; box-shadow: 0 4px 20px rgba(46,230,34,0.35); transition: box-shadow 0.2s, transform 0.1s; }
    .login-btn:hover { box-shadow: 0 6px 28px rgba(46,230,34,0.5); transform: translateY(-1px); }
    .saving-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #2EE622; margin-left: 6px; vertical-align: middle; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* 이미지 업로드 */
    .img-upload-box { width: 100%; aspect-ratio: 1/1; border-radius: 12px; border: 2px dashed ${BORDER}; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #eef1fa; transition: border-color 0.2s; margin-bottom: 8px; }
    .img-upload-box:hover { border-color: ${BG_DARK}; }
    .img-upload-progress { width: 100%; height: 4px; background: #e0e8f8; border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .img-upload-progress-bar { height: 100%; background: ${BG_DARK}; border-radius: 2px; transition: width 0.3s; }
`;

/* ── Data Schemas ── */
const EMPTY_MUSIC      = { id: null, filmTitle: "", musicTitle: "", date: "", link: "", composer: "", year: "", genre: "", context: "", function: "", review: "", questions: "", scraps: "", anecdotes: "", hashtags: "", composition: { melody: "", harmony: "", rhythm: "", timbre: "", dynamics: "" } };
const EMPTY_COMPOSER   = { id: null, name: "", photo: null, description: "", traits: "", workIds: [], anecdotes: "", scraps: "", hashtags: "" };
const EMPTY_GENRE      = { id: null, name: "", photo: null, summary: "", traits: "", anecdotes: "", scraps: "", hashtags: "" };
const EMPTY_INSTRUMENT = { id: null, name: "", photo: null, summary: "", detail: "", traits: "", usage: "", artist: "", anecdotes: "", scraps: "", hashtags: "" };
const EMPTY_CONCEPT    = { id: null, name: "", summary: "", detail: "", usage: "", anecdotes: "", scraps: "", hashtags: "" };

/* ── 이미지 업로드 컴포넌트 ── */
function ImageUploader({ photo, onUploaded, userId, itemType }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress]   = useState(0);
    const inputRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("5MB 이하의 이미지만 업로드할 수 있습니다.");
            return;
        }

        setUploading(true);
        setProgress(0);

        const ext      = file.name.split('.').pop();
        const path     = `users/${userId}/${itemType}/${Date.now()}.${ext}`;
        const storageRef = storage.ref(path);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snap) => {
                setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
            },
            (err) => {
                console.error("업로드 오류:", err);
                alert("업로드 중 오류가 발생했습니다.");
                setUploading(false);
            },
            async () => {
                const url = await uploadTask.snapshot.ref.getDownloadURL();
                onUploaded(url);
                setUploading(false);
                setProgress(0);
            }
        );
    };

    return (
        <div style={{ marginBottom: 20 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>사진</label>

            {/* 미리보기 or 업로드 박스 */}
            {photo ? (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img
                        src={photo}
                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, border: `1px solid ${BORDER}`, display: 'block' }}
                        onError={e => e.target.style.display = 'none'}
                    />
                    <button
                        onClick={() => onUploaded(null)}
                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                    >
                        삭제
                    </button>
                </div>
            ) : (
                <div className="img-upload-box" onClick={() => !uploading && inputRef.current.click()}>
                    {uploading ? (
                        <div style={{ width: '80%', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, color: BG_DARK, marginBottom: 8, fontWeight: 600 }}>업로드 중... {progress}%</div>
                            <div className="img-upload-progress">
                                <div className="img-upload-progress-bar" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 13, color: BG_DARK, fontWeight: 600 }}>사진 업로드</div>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>JPG, PNG, WEBP · 최대 5MB</div>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
            />

            {/* 이미 사진이 있을 때 교체 버튼 */}
            {photo && !uploading && (
                <button
                    onClick={() => inputRef.current.click()}
                    style={{ width: '100%', padding: '10px', background: '#eef1fa', border: `1px dashed ${BORDER}`, borderRadius: 10, color: BG_DARK, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 4 }}
                >
                    사진 교체
                </button>
            )}
        </div>
    );
}

function Polyphonic() {
    /* ── Auth & 로딩 상태 ── */
    const [user,        setUser]        = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [saving,      setSaving]      = useState(false);
    const syncEnabled = useRef(false);

    const [activeTab, setActiveTab] = useState("library");
    const [view, setView] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [targetHashtag, setTargetHashtag] = useState("");

    /* ── 데이터 상태 ── */
    const [musics,      setMusics]      = useState([]);
    const [composers,   setComposers]   = useState([]);
    const [genres,      setGenres]      = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [concepts,    setConcepts]    = useState([]);

    /* ── 1. 인증 상태 감지 & Firestore에서 데이터 로드 ── */
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
            setUser(u);
            if (u) {
                try {
                    const snap = await db.collection('users').doc(u.uid).get();
                    if (snap.exists) {
                        const d = snap.data();
                        if (d.musics)      setMusics(d.musics);
                        if (d.composers)   setComposers(d.composers);
                        if (d.genres)      setGenres(d.genres);
                        if (d.instruments) setInstruments(d.instruments);
                        if (d.concepts)    setConcepts(d.concepts);
                    }
                } catch (e) {
                    console.error("Firestore 로드 오류:", e);
                }
            } else {
                setMusics([]); setComposers([]); setGenres([]); setInstruments([]); setConcepts([]);
                syncEnabled.current = false;
            }
            syncEnabled.current = true;
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    /* ── 2. 데이터 변경 시 Firestore에 자동 저장 ── */
    useEffect(() => {
        if (!syncEnabled.current || !user) return;
        setSaving(true);
        const timer = setTimeout(() => {
            db.collection('users').doc(user.uid)
                .set({ musics, composers, genres, instruments, concepts })
                .then(() => setSaving(false))
                .catch(e => { console.error("저장 오류:", e); setSaving(false); });
        }, 800);
        return () => clearTimeout(timer);
    }, [musics, composers, genres, instruments, concepts]);

    const [showModal, setShowModal] = useState({ music: false, comp: false, genre: false, instrument: false, concept: false });
    const [forms, setForms] = useState({ music: EMPTY_MUSIC, comp: EMPTY_COMPOSER, genre: EMPTY_GENRE, instrument: EMPTY_INSTRUMENT, concept: EMPTY_CONCEPT });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCompositionLayer, setShowCompositionLayer] = useState(false);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const all = [
            ...musics.map(m      => ({ ...m,  _type: 'library',    _title: m.musicTitle })),
            ...composers.map(c   => ({ ...c,  _type: 'composer',   _title: c.name })),
            ...genres.map(g      => ({ ...g,  _type: 'genre',      _title: g.name })),
            ...instruments.map(i => ({ ...i,  _type: 'instrument', _title: i.name })),
            ...concepts.map(cp   => ({ ...cp, _type: 'concept',    _title: cp.name }))
        ];
        return all.filter(item => {
            const title   = (item._title || "").toLowerCase();
            const content = Object.values(item).filter(v => typeof v === 'string' && !v.startsWith('http')).join(" ").toLowerCase();
            return title.includes(q) || content.includes(q);
        });
    }, [searchQuery, musics, composers, genres, instruments, concepts]);

    const hashtagFilteredData = useMemo(() => {
        if (!targetHashtag) return { library: [], composer: [], genre: [], instrument: [], concept: [] };
        const check = (item) => (item.hashtags || "").split(" ").some(h => h === targetHashtag || h === `#${targetHashtag}`);
        return {
            library:    musics.filter(check),
            composer:   composers.filter(check),
            genre:      genres.filter(check),
            instrument: instruments.filter(check),
            concept:    concepts.filter(check)
        };
    }, [targetHashtag, musics, composers, genres, instruments, concepts]);

    const openAddModal = () => {
        const key      = activeTab === 'library' ? 'music' : activeTab === 'composer' ? 'comp' : activeTab;
        const emptyVal = activeTab === 'library' ? EMPTY_MUSIC : activeTab === 'composer' ? EMPTY_COMPOSER : activeTab === 'genre' ? EMPTY_GENRE : activeTab === 'instrument' ? EMPTY_INSTRUMENT : EMPTY_CONCEPT;
        setForms(prev => ({ ...prev, [key]: emptyVal }));
        setShowModal(prev => ({ ...prev, [key]: true }));
    };

    /* ── 로딩 화면 ── */
    if (authLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: '#3D3FD9' }}>
                <div style={{ fontWeight: 900, fontSize: 24, color: '#fff' }}>POLY<span style={{ color: '#2EE622' }}>PHONIC</span></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>로딩 중...</div>
            </div>
        );
    }

    /* ── 로그인 화면 ── */
    if (!user) {
        return (
            <div>
                <style>{globalStyle}</style>
                <div className="login-screen">
                    <div style={{ fontWeight: 900, fontSize: 36, marginBottom: 8, color: '#fff' }}>POLY<span style={{ color: '#2EE622' }}>PHONIC</span></div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 48 }}>음악 아카이빙 앱</div>
                    <button className="login-btn" onClick={() => auth.signInWithPopup(provider)}>
                        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        Google로 로그인
                    </button>
                    <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.8 }}>
                        로그인하면 모든 기기에서<br />데이터가 자동으로 동기화됩니다.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh" }}>
            <style>{globalStyle}</style>

            {/* ── 헤더 ── */}
            <header>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 55 }}>
                    <div onClick={() => { setActiveTab("library"); setView("list"); setSearchQuery(""); }} style={{ cursor: "pointer", fontWeight: 900, fontSize: 20, color: TEXT_MAIN }}>
                        POLY<span style={{ color: BG_DARK }}>PHONIC</span>
                        {saving && <span className="saving-dot" title="저장 중..." />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {user.photoURL && <img src={user.photoURL} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BORDER}` }} />}
                            <button onClick={() => auth.signOut()} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: '#6b7aaa', cursor: 'pointer' }}>
                                로그아웃
                            </button>
                        </div>
                        <button onClick={openAddModal} style={{ background: BG_DARK, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            + 추가
                        </button>
                    </div>
                </div>
                <div className="search-container">
                    <input className="search-input" placeholder="무엇이든 검색하세요..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <nav style={{ display: "flex", padding: "0 20px 5px", overflowX: "auto" }} className="scroll-container">
                    {["library", "composer", "genre", "instrument", "concept"].map(t => (
                        <button key={t} onClick={() => { setActiveTab(t); setView("list"); setSearchQuery(""); }}
                            style={{ background: "none", border: "none", borderBottom: activeTab === t ? `3px solid ${BG_DARK}` : "3px solid transparent", padding: "12px 18px", fontSize: 14, fontWeight: activeTab === t ? 800 : 500, color: activeTab === t ? BG_DARK : "#6b7aaa", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {t === "library" ? "보관함" : t === "composer" ? "작곡가" : t === "genre" ? "장르" : t === "instrument" ? "악기" : "개념"}
                        </button>
                    ))}
                </nav>
            </header>

            {/* ── 검색 결과 ── */}
            {searchQuery && (
                <div className="search-results scroll-container" style={{ maxHeight: '70vh', overflowY: 'auto', left: '50%', transform: 'translateX(-50%)' }}>
                    {searchResults.map((item, idx) => (
                        <div key={idx} className="search-item" onClick={() => { setSelectedItem(item); setActiveTab(item._type); setView("detail"); setSearchQuery(""); }}>
                            <span className="search-tag">{item._type.toUpperCase()}</span>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>{item._title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── 메인 ── */}
            <main style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 100 }}>

                {/* 목록 */}
                {view === "list" && (
                    <div>
                        {activeTab === "library" && musics.map(m => (
                            <div key={m.id} onClick={() => { setSelectedItem(m); setView("detail"); }} style={{ padding: "25px 20px", borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                                <div style={{ fontSize: 11, color: "#6b7aaa", marginBottom: 5 }}>{m.composer} • {m.genre}</div>
                                <div style={{ fontSize: 22, fontWeight: 800 }}>{m.musicTitle}</div>
                                <div style={{ fontSize: 14, color: "#6b7aaa" }}>《{m.filmTitle}》</div>
                            </div>
                        ))}
                        {(activeTab === "composer" || activeTab === "genre" || activeTab === "instrument") && (
                            <div className="grid-layout">
                                {(activeTab === "composer" ? composers : activeTab === "genre" ? genres : instruments).map(item => (
                                    <div key={item.id} className="grid-card" onClick={() => { setSelectedItem(item); setView("detail"); }}>
                                        {item.photo
                                            ? <img src={item.photo} className="grid-img" />
                                            : <div className="grid-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎵</div>
                                        }
                                        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "concept" && concepts.map(c => (
                            <div key={c.id} className="concept-card" onClick={() => { setSelectedItem(c); setView("detail"); }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: BG_DARK, marginBottom: 5 }}>{c.name}</div>
                                <div style={{ fontSize: 13, color: "#6b7aaa" }}>{c.summary}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 상세 */}
                {view === "detail" && (
                    <DetailView
                        type={activeTab} data={selectedItem} musics={musics}
                        onBack={() => setView("list")}
                        onHashtagClick={(tag) => { setTargetHashtag(tag); setView("hashtagPage"); }}
                        onEdit={() => {
                            const key = activeTab === 'library' ? 'music' : activeTab === 'composer' ? 'comp' : activeTab;
                            setForms({ ...forms, [key]: selectedItem });
                            setShowModal({ ...showModal, [key]: true });
                        }}
                        onDelete={() => {
                            if (confirm("삭제하시겠습니까?")) {
                                if      (activeTab === "library")    setMusics(musics.filter(x => x.id !== selectedItem.id));
                                else if (activeTab === "composer")   setComposers(composers.filter(x => x.id !== selectedItem.id));
                                else if (activeTab === "genre")      setGenres(genres.filter(x => x.id !== selectedItem.id));
                                else if (activeTab === "instrument") setInstruments(instruments.filter(x => x.id !== selectedItem.id));
                                else if (activeTab === "concept")    setConcepts(concepts.filter(x => x.id !== selectedItem.id));
                                setView("list");
                            }
                        }}
                    />
                )}

                {/* 해시태그 페이지 */}
                {view === "hashtagPage" && (
                    <div style={{ padding: "20px 25px" }}>
                        <button onClick={() => setView("detail")} style={{ border: "none", background: "none", color: BG_DARK, fontWeight: 800, cursor: 'pointer', marginBottom: 20 }}>← 뒤로가기</button>
                        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 30 }}><span style={{ color: BG_DARK }}>{targetHashtag}</span> 검색 결과</h1>
                        {Object.entries(hashtagFilteredData).map(([key, list]) => list.length > 0 && (
                            <div key={key} style={{ marginBottom: 30 }}>
                                <div className="hashtag-group-title">{key.toUpperCase()}</div>
                                {key === 'library' ? list.map(m => (
                                    <div key={m.id} onClick={() => { setSelectedItem(m); setActiveTab('library'); setView('detail'); }} style={{ padding: '15px 0', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 700 }}>{m.musicTitle}</div>
                                        <div style={{ fontSize: 12, color: '#6b7aaa' }}>《{m.filmTitle}》</div>
                                    </div>
                                )) : (
                                    <div className="grid-layout" style={{ padding: '10px 0' }}>
                                        {list.map(item => (
                                            <div key={item.id} className="grid-card" onClick={() => { setSelectedItem(item); setActiveTab(key); setView('detail'); }}>
                                                {item.photo
                                                    ? <img src={item.photo} className="grid-img" />
                                                    : <div className="grid-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎵</div>
                                                }
                                                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 5 }}>{item.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ══ 모달: 음악 ══ */}
            {showModal.music && <div className="modal-overlay"><div className="modal-content scroll-container">
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>음악 기록</h2>
                <Input label="영화 제목"           value={forms.music.filmTitle}  onChange={v => setForms({ ...forms, music: { ...forms.music, filmTitle: v } })} />
                <Input label="음악 제목"           value={forms.music.musicTitle} onChange={v => setForms({ ...forms, music: { ...forms.music, musicTitle: v } })} />
                <Input label="날짜"                value={forms.music.date}       onChange={v => setForms({ ...forms, music: { ...forms.music, date: v } })} />
                <Input label="링크"                value={forms.music.link}       onChange={v => setForms({ ...forms, music: { ...forms.music, link: v } })} />
                <Input label="작곡가"              value={forms.music.composer}   onChange={v => setForms({ ...forms, music: { ...forms.music, composer: v } })} />
                <Input label="제작 연도"           value={forms.music.year}       onChange={v => setForms({ ...forms, music: { ...forms.music, year: v } })} />
                <Input label="장르"                value={forms.music.genre}      onChange={v => setForms({ ...forms, music: { ...forms.music, genre: v } })} />
                <Input label="맥락"         isArea value={forms.music.context}    onChange={v => setForms({ ...forms, music: { ...forms.music, context: v } })} />
                <Input label="기능"         isArea value={forms.music.function}   onChange={v => setForms({ ...forms, music: { ...forms.music, function: v } })} />
                <div style={{ marginBottom: 20 }}>
                    <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>구성 분석</label>
                    <button onClick={() => setShowCompositionLayer(true)} style={{ width: '100%', padding: 12, background: '#eef1fa', border: `1px dashed ${BORDER}`, borderRadius: 8, color: BG_DARK, fontWeight: 600, cursor: 'pointer' }}>구성 분석 입력</button>
                </div>
                <Input label="감상 및 질문" isArea value={forms.music.review}    onChange={v => setForms({ ...forms, music: { ...forms.music, review: v } })} />
                <Input label="스크랩"              value={forms.music.scraps}     onChange={v => setForms({ ...forms, music: { ...forms.music, scraps: v } })} />
                <Input label="여담"         isArea value={forms.music.anecdotes}  onChange={v => setForms({ ...forms, music: { ...forms.music, anecdotes: v } })} />
                <Input label="해시태그 (#으로 구분)" value={forms.music.hashtags} onChange={v => setForms({ ...forms, music: { ...forms.music, hashtags: v } })} />
                <button onClick={() => { setMusics(forms.music.id ? musics.map(m => m.id === forms.music.id ? forms.music : m) : [{ ...forms.music, id: Date.now() }, ...musics]); setShowModal({ ...showModal, music: false }); }} style={{ width: '100%', padding: 18, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>저장</button>
            </div></div>}

            {/* ══ 모달: 작곡가 ══ */}
            {showModal.comp && <div className="modal-overlay"><div className="modal-content scroll-container">
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>작곡가 등록</h2>
                <ImageUploader
                    photo={forms.comp.photo}
                    onUploaded={url => setForms({ ...forms, comp: { ...forms.comp, photo: url } })}
                    userId={user.uid}
                    itemType="composer"
                />
                <Input label="이름"        value={forms.comp.name}        onChange={v => setForms({ ...forms, comp: { ...forms.comp, name: v } })} />
                <Input label="설명" isArea value={forms.comp.description} onChange={v => setForms({ ...forms, comp: { ...forms.comp, description: v } })} />
                <Input label="특징" isArea value={forms.comp.traits}      onChange={v => setForms({ ...forms, comp: { ...forms.comp, traits: v } })} />
                <SearchPicker label="참여 작품" list={musics} filterKey="musicTitle" selectedIds={forms.comp.workIds || []}
                    onSelect={id => setForms({ ...forms, comp: { ...forms.comp, workIds: forms.comp.workIds?.includes(id) ? forms.comp.workIds.filter(x => x !== id) : [...(forms.comp.workIds || []), id] } })} />
                <Input label="여담"  isArea value={forms.comp.anecdotes} onChange={v => setForms({ ...forms, comp: { ...forms.comp, anecdotes: v } })} />
                <Input label="스크랩"       value={forms.comp.scraps}    onChange={v => setForms({ ...forms, comp: { ...forms.comp, scraps: v } })} />
                <Input label="해시태그"     value={forms.comp.hashtags}  onChange={v => setForms({ ...forms, comp: { ...forms.comp, hashtags: v } })} />
                <button onClick={() => { setComposers(forms.comp.id ? composers.map(c => c.id === forms.comp.id ? forms.comp : c) : [{ ...forms.comp, id: Date.now() }, ...composers]); setShowModal({ ...showModal, comp: false }); }} style={{ width: '100%', padding: 18, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>저장</button>
            </div></div>}

            {/* ══ 모달: 장르 ══ */}
            {showModal.genre && <div className="modal-overlay"><div className="modal-content scroll-container">
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>장르 등록</h2>
                <ImageUploader
                    photo={forms.genre.photo}
                    onUploaded={url => setForms({ ...forms, genre: { ...forms.genre, photo: url } })}
                    userId={user.uid}
                    itemType="genre"
                />
                <Input label="이름"        value={forms.genre.name}      onChange={v => setForms({ ...forms, genre: { ...forms.genre, name: v } })} />
                <Input label="개요" isArea value={forms.genre.summary}   onChange={v => setForms({ ...forms, genre: { ...forms.genre, summary: v } })} />
                <Input label="특징" isArea value={forms.genre.traits}    onChange={v => setForms({ ...forms, genre: { ...forms.genre, traits: v } })} />
                <Input label="여담" isArea value={forms.genre.anecdotes} onChange={v => setForms({ ...forms, genre: { ...forms.genre, anecdotes: v } })} />
                <Input label="스크랩"       value={forms.genre.scraps}   onChange={v => setForms({ ...forms, genre: { ...forms.genre, scraps: v } })} />
                <Input label="해시태그"     value={forms.genre.hashtags} onChange={v => setForms({ ...forms, genre: { ...forms.genre, hashtags: v } })} />
                <button onClick={() => { setGenres(forms.genre.id ? genres.map(g => g.id === forms.genre.id ? forms.genre : g) : [{ ...forms.genre, id: Date.now() }, ...genres]); setShowModal({ ...showModal, genre: false }); }} style={{ width: '100%', padding: 18, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>저장</button>
            </div></div>}

            {/* ══ 모달: 악기 ══ */}
            {showModal.instrument && <div className="modal-overlay"><div className="modal-content scroll-container">
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>악기 추가</h2>
                <ImageUploader
                    photo={forms.instrument.photo}
                    onUploaded={url => setForms({ ...forms, instrument: { ...forms.instrument, photo: url } })}
                    userId={user.uid}
                    itemType="instrument"
                />
                <Input label="이름"           value={forms.instrument.name}      onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, name: v } })} />
                <Input label="개요"    isArea value={forms.instrument.summary}   onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, summary: v } })} />
                <Input label="상세"    isArea value={forms.instrument.detail}    onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, detail: v } })} />
                <Input label="특징"    isArea value={forms.instrument.traits}    onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, traits: v } })} />
                <Input label="활용"    isArea value={forms.instrument.usage}     onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, usage: v } })} />
                <Input label="주요 아티스트"  value={forms.instrument.artist}    onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, artist: v } })} />
                <Input label="여담"    isArea value={forms.instrument.anecdotes} onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, anecdotes: v } })} />
                <Input label="스크랩"         value={forms.instrument.scraps}    onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, scraps: v } })} />
                <Input label="해시태그"       value={forms.instrument.hashtags}  onChange={v => setForms({ ...forms, instrument: { ...forms.instrument, hashtags: v } })} />
                <button onClick={() => { setInstruments(forms.instrument.id ? instruments.map(i => i.id === forms.instrument.id ? forms.instrument : i) : [{ ...forms.instrument, id: Date.now() }, ...instruments]); setShowModal({ ...showModal, instrument: false }); }} style={{ width: '100%', padding: 18, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>저장</button>
            </div></div>}

            {/* ══ 모달: 개념 ══ */}
            {showModal.concept && <div className="modal-overlay"><div className="modal-content scroll-container">
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>개념 추가</h2>
                <Input label="용어명"              value={forms.concept.name}      onChange={v => setForms({ ...forms, concept: { ...forms.concept, name: v } })} />
                <Input label="개요"        isArea value={forms.concept.summary}   onChange={v => setForms({ ...forms, concept: { ...forms.concept, summary: v } })} />
                <Input label="상세"        isArea value={forms.concept.detail}    onChange={v => setForms({ ...forms, concept: { ...forms.concept, detail: v } })} />
                <Input label="활용"        isArea value={forms.concept.usage}     onChange={v => setForms({ ...forms, concept: { ...forms.concept, usage: v } })} />
                <Input label="사례 및 여담" isArea value={forms.concept.anecdotes} onChange={v => setForms({ ...forms, concept: { ...forms.concept, anecdotes: v } })} />
                <Input label="스크랩"              value={forms.concept.scraps}   onChange={v => setForms({ ...forms, concept: { ...forms.concept, scraps: v } })} />
                <Input label="해시태그"            value={forms.concept.hashtags} onChange={v => setForms({ ...forms, concept: { ...forms.concept, hashtags: v } })} />
                <button onClick={() => { setConcepts(forms.concept.id ? concepts.map(c => c.id === forms.concept.id ? forms.concept : c) : [{ ...forms.concept, id: Date.now() }, ...concepts]); setShowModal({ ...showModal, concept: false }); }} style={{ width: '100%', padding: 18, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>저장</button>
            </div></div>}

            {/* ══ 구성 분석 레이어 ══ */}
            {showCompositionLayer && <div className="modal-overlay" style={{ zIndex: 1100, alignItems: 'center' }}><div style={{ background: '#fff', width: '90%', maxWidth: 400, borderRadius: 20, padding: 25 }}>
                <h3 style={{ marginBottom: 20, color: BG_DARK }}>구성 분석</h3>
                {['melody', 'harmony', 'rhythm', 'timbre', 'dynamics'].map(k => (
                    <div key={k} style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>{k.toUpperCase()}</label>
                        <textarea value={forms.music.composition[k]} onChange={e => setForms({ ...forms, music: { ...forms.music, composition: { ...forms.music.composition, [k]: e.target.value } } })} style={{ width: '100%', padding: 8, border: `1px solid ${BORDER}`, borderRadius: 8 }} rows={2} />
                    </div>
                ))}
                <button onClick={() => setShowCompositionLayer(false)} style={{ width: '100%', padding: 12, background: BG_DARK, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>완료</button>
            </div></div>}
        </div>
    );
}

/* ── 상세 뷰 ── */
function DetailView({ type, data, musics, onBack, onEdit, onDelete, onHashtagClick }) {
    const [anOpen, setAnOpen] = useState(false);
    const tags = (data.hashtags || "").split(" ").filter(t => t.length > 0);
    const linkedWorks = musics.filter(m => data.workIds?.includes(m.id));

    return (
        <div style={{ padding: "20px 25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
                <button onClick={onBack} style={{ border: "none", background: "none", color: BG_DARK, fontWeight: 700, cursor: 'pointer' }}>← 목록으로</button>
                <div style={{ display: 'flex', gap: 15 }}>
                    <button onClick={onEdit}   style={{ border: "none", background: "none", color: "#999",    fontSize: 13, cursor: 'pointer' }}>수정</button>
                    <button onClick={onDelete} style={{ border: "none", background: "none", color: "#ff4d4f", fontSize: 13, cursor: 'pointer' }}>삭제</button>
                </div>
            </div>

            {data.photo && <img src={data.photo} style={{ width: "100%", aspectRatio: "1/1", borderRadius: 20, objectFit: "cover", marginBottom: 30 }} />}
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 5 }}>{type === 'library' ? data.musicTitle : data.name}</h1>
            {type === 'library' && <div style={{ fontSize: 20, color: '#6b7aaa', marginBottom: 20, fontWeight: 500 }}>《{data.filmTitle}》</div>}

            <div style={{ marginBottom: 30 }}>
                {tags.map((tag, i) => <a key={i} className="hashtag-link" onClick={() => onHashtagClick(tag.startsWith("#") ? tag : "#" + tag)}>{tag.startsWith("#") ? tag : "#" + tag}</a>)}
            </div>

            <div>
                {type === 'library' && (<>
                    <Section label="기록 날짜" content={data.date} />
                    <Section label="감상 링크">{data.link ? <a href={data.link} target="_blank" style={{ color: BG_DARK }}>{data.link}</a> : "-"}</Section>
                    <Section label="작곡가"    content={data.composer} />
                    <Section label="제작 연도" content={data.year} />
                    <Section label="장르"      content={data.genre} />
                    <Section label="맥락"      content={data.context} />
                    <Section label="기능"      content={data.function} />
                    <Section label="구성 분석">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                            {Object.entries(data.composition || {}).map(([k, v]) => (
                                <div key={k} style={{ background: '#eef1fa', padding: '12px', borderRadius: 12, border: `1px solid ${BORDER}` }}>
                                    <div style={{ fontSize: 10, color: BG_DARK, fontWeight: 800, marginBottom: 4 }}>{k.toUpperCase()}</div>
                                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{v || '-'}</div>
                                </div>
                            ))}
                        </div>
                    </Section>
                    <Section label="감상 및 질문" content={data.review} />
                    <Section label="스크랩"       content={data.scraps} />
                </>)}
                {type === 'composer' && (<>
                    <Section label="설명"     content={data.description} />
                    <Section label="특징"     content={data.traits} />
                    <Section label="참여 작품">{linkedWorks.length > 0 ? linkedWorks.map(m => <div key={m.id}>• {m.musicTitle} ({m.filmTitle})</div>) : "-"}</Section>
                    <Section label="스크랩"   content={data.scraps} />
                </>)}
                {type === 'genre'      && (<><Section label="개요" content={data.summary} /><Section label="특징" content={data.traits} /><Section label="스크랩" content={data.scraps} /></>)}
                {type === 'instrument' && (<>
                    <Section label="개요"          content={data.summary} />
                    <Section label="상세"          content={data.detail} />
                    <Section label="특징"          content={data.traits} />
                    <Section label="활용"          content={data.usage} />
                    <Section label="주요 아티스트" content={data.artist} />
                    <Section label="스크랩"        content={data.scraps} />
                </>)}
                {type === 'concept' && (<><Section label="개요" content={data.summary} /><Section label="상세" content={data.detail} /><Section label="활용" content={data.usage} /><Section label="스크랩" content={data.scraps} /></>)}

                <div style={{ padding: '20px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <div onClick={() => setAnOpen(!anOpen)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}>
                        <span className="section-label" style={{ marginBottom: 0 }}>여담 및 실례</span>
                        <span style={{ fontSize: 12, color: BG_DARK }}>{anOpen ? '▲ 접기' : '▼ 열기'}</span>
                    </div>
                    {anOpen && <div className="accordion">{data.anecdotes || '내용이 없습니다.'}</div>}
                </div>
            </div>
        </div>
    );
}

/* ── 공통 컴포넌트 ── */
function Section({ label, content, children }) {
    return (
        <div style={{ padding: "22px 0", borderBottom: `1px solid ${BORDER}` }}>
            <div className="section-label">{label}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#333" }}>{content || children || "-"}</div>
        </div>
    );
}

function Input({ label, value, onChange, isArea }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>{label}</label>
            {isArea
                ? <textarea value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: 12, border: `1px solid ${BORDER}`, borderRadius: 12, minHeight: 100, outline: 'none', fontSize: 14 }} />
                : <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: 12, border: `1px solid ${BORDER}`, borderRadius: 12, outline: 'none', fontSize: 14 }} />
            }
        </div>
    );
}

function SearchPicker({ label, list, filterKey, selectedIds, onSelect }) {
    return (
        <div style={{ marginBottom: 22 }}>
            <label className="section-label">{label}</label>
            <div style={{ maxHeight: 100, overflowY: 'auto', border: `1px solid ${BORDER}`, marginTop: 8, borderRadius: 10, padding: 5 }}>
                {list.map(i => (
                    <div key={i.id} onClick={() => onSelect(i.id)} style={{ padding: '8px 12px', fontSize: 12, background: selectedIds.includes(i.id) ? ACCENT_LIGHT : 'none', cursor: 'pointer', borderRadius: 8, color: selectedIds.includes(i.id) ? BG_DARK : 'inherit' }}>
                        {selectedIds.includes(i.id) ? '✓ ' : '+ '}{i[filterKey]}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── 마운트 ── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Polyphonic />);
