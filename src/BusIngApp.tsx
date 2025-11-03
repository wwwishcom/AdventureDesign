import { useEffect, useMemo, useState } from "react";

/** 393 x 852 아이폰 프레임 자동 스케일 */
function usePhoneScale(baseW = 393, baseH = 852, padding = 24) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const sw = window.innerWidth - padding * 2;
      const sh = window.innerHeight - padding * 2;
      setScale(Math.min(sw / baseW, sh / baseH));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseW, baseH, padding]);
  return scale;
}

/* -------------------- 라우팅 상태 -------------------- */
type Page =
  | "splash"
  | "signup1"
  | "signup2"
  | "login"
  | "home"
  | "transit"
  | "volunteerCall"
  | "reportObstacle"
  | "mapNearby"
  | "profile"
  | "ai";

type Cred = { id: string; pw: string };

/** -------------------- 루트 앱 -------------------- */
export default function BusIngApp() {
  const [page, setPage] = useState<Page>("splash");
  const [showVolunteer, setShowVolunteer] = useState(false);
  const scale = usePhoneScale();

  // 회원가입에서 입력한 아이디/비번 저장 (지속)
  const [cred, setCred] = useState<Cred>(() => {
    try {
      return JSON.parse(localStorage.getItem("busingCred") || `{"id":"","pw":""}`);
    } catch {
      return { id: "", pw: "" };
    }
  });
  const updateCred = (patch: Partial<Cred>) =>
    setCred((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("busingCred", JSON.stringify(next));
      return next;
    });

  // 스플래시 → 자동 진입
  useEffect(() => {
    if (page === "splash") {
      const id = setTimeout(() => setPage("signup1"), 900);
      return () => clearTimeout(id);
    }
  }, [page]);

  // 디버그: 방향키 좌우로 이동
  useEffect(() => {
    const pages: Page[] = ["splash", "signup1", "signup2", "login", "home"];
    const onKey = (e: KeyboardEvent) => {
      const i = pages.indexOf(page);
      if (e.key === "ArrowRight" && i < pages.length - 1) setPage(pages[i + 1]);
      if (e.key === "ArrowLeft" && i > 0) setPage(pages[i - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page]);

  return (
    <div style={stage}>
      <div style={{ ...phone, transform: `scale(${scale})` }}>
        <StatusBar />

        {page === "splash" && <Splash />}

        {page === "signup1" && (
          <Signup1
            idValue={cred.id}
            pwValue={cred.pw}
            onChangeId={(v) => updateCred({ id: v })}
            onChangePw={(v) => updateCred({ pw: v })}
            onVolunteerOpen={() => setShowVolunteer(true)}
            onDone={() => setPage("signup2")}
          />
        )}

        {page === "signup2" && <Signup2 onNext={() => setPage("login")} />}

        {page === "login" && (
          <Login
            expectedId={cred.id}
            expectedPw={cred.pw}
            onSuccess={() => setPage("home")}
          />
        )}

        {page === "home" && <Home onGo={(p) => setPage(p)} />}

        {/* 기능 화면들 */}
        {page === "transit" && <ScreenFrame title="대중교통 이용하기" onBack={() => setPage("home")}><TransitScreen /></ScreenFrame>}
        {page === "volunteerCall" && <ScreenFrame title="자원봉사자 호출하기" onBack={() => setPage("home")}><VolunteerCallScreen /></ScreenFrame>}
        {page === "reportObstacle" && <ScreenFrame title="장애물 제보하기" onBack={() => setPage("home")}><ReportObstacleScreen /></ScreenFrame>}
        {page === "mapNearby" && <ScreenFrame title="주변 장애물 지도" onBack={() => setPage("home")}><MapNearbyScreen /></ScreenFrame>}
        {page === "profile" && <ScreenFrame title="내 정보" onBack={() => setPage("home")}><ProfileScreen savedId={cred.id} /></ScreenFrame>}
        {page === "ai" && <ScreenFrame title="Bus-ing AI" onBack={() => setPage("home")}><AIScreen /></ScreenFrame>}

        {/* 회원가입 - 자원봉사자 등록 모달 */}
        {showVolunteer && (
          <VolunteerSheet
            onClose={() => setShowVolunteer(false)}
            onSubmit={() => {
              setShowVolunteer(false);
              setPage("signup2");
            }}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------- 공통 스타일 -------------------- */
const stage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const phone: React.CSSProperties = {
  width: 393,
  height: 852,
  borderRadius: 30,
  background: "#fff",
  boxShadow: "0 30px 60px rgba(0,0,0,.15)",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  position: "relative",
  transformOrigin: "center center",
};
const screen: React.CSSProperties = {
  padding: "14px 16px 24px",
};
const title: React.CSSProperties = { fontSize: 22, fontWeight: 800, margin: 0 };
const label: React.CSSProperties = { fontWeight: 700, fontSize: 14 };
const field: React.CSSProperties = {
  display: "block",
  width: "100%",
  border: "1px solid #e5e7eb",
  background: "#f7f7fb",
  borderRadius: 12,
  padding: "12px 14px",
  outline: "none",
};
const rightGray: React.CSSProperties = { color: "#6b7280", fontSize: 13 };
const sub: React.CSSProperties = { color: "#9aa0a6", fontSize: 12, marginTop: 6 };
const primaryBtn: React.CSSProperties = {
  width: "100%",
  border: "1px solid #4338ca",
  background: "#4f46e5",
  color: "#fff",
  borderRadius: 14,
  padding: "14px 16px",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

/* -------------------- 컴포넌트 공통 -------------------- */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time = useMemo(
    () =>
      now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [now]
  );
  return time;
}

function IconSignal() {
  return (
    <svg width="20" height="15" viewBox="0 0 20 12" fill="none">
      <rect x="0.5" y="7.5" width="3" height="4" rx="1" fill="#111" />
      <rect x="5" y="6" width="3" height="5.5" rx="1" fill="#111" />
      <rect x="9.5" y="3.5" width="3" height="8" rx="1" fill="#111" />
      <rect x="14" y="1.5" width="3" height="10" rx="1" fill="#111" />
    </svg>
  );
}
function IconWifi() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 12" fill="none">
      <path d="M1 4.5C5.5 1 12.5 1 17 4.5" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 7c3-2 7-2 10 0" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#111" />
    </svg>
  );
}
function IconBattery() {
  return (
    <svg width="26" height="15" viewBox="0 0 26 12" fill="none">
      <rect x="1" y="1" width="20" height="10" rx="2" stroke="#111" strokeWidth="1.5" />
      <rect x="3" y="3" width="16" height="6" rx="1.5" fill="#111" />
      <rect x="22.5" y="4" width="3" height="4" rx="1" fill="#111" />
    </svg>
  );
}

function StatusBar() {
  const time = useClock();
  return (
    <div
      style={{
        height: 52,
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(to bottom, rgba(0,0,0,.06), rgba(0,0,0,0))",
      }}
    >
      <div style={{ fontWeight: 700 }}>{time}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <IconSignal />
        <IconWifi />
        <IconBattery />
      </div>
    </div>
  );
}

/* 1. 초기 로딩화면 */
function Splash() {
  return (
    <div
      style={{
        ...screen,
        height: 852 - 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 900 }}>Bus-ing</div>
      <div style={{ color: "#6b7280" }}>집을 나서는 안심 첫걸음</div>
      <div style={{ fontSize: 56 }}>🌲 🚌 ♿</div>
    </div>
  );
}

/* 2. 회원가입1 */
function Signup1({
  onVolunteerOpen,
  onDone,
  idValue,
  pwValue,
  onChangeId,
  onChangePw,
}: {
  onVolunteerOpen: () => void;
  onDone: () => void;
  idValue: string;
  pwValue: string;
  onChangeId: (v: string) => void;
  onChangePw: (v: string) => void;
}) {
  return (
    <div style={screen}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={title}>[ 회원 가입 ]</h1>
        <div style={{ marginLeft: "auto", opacity: 0.6, fontSize: 18 }}>🎙️</div>
      </div>
      <div style={{ color: "#9aa0a6", fontSize: 14, margin: "6px 0 12px" }}>✍️ 음성 입력 지원 (Whisper AI)</div>

      {/* 이름 */}
      <div style={{ ...row, padding: "14px 14px" }}>
        <div style={label}>이름</div>
        <div style={rightGray}>강지수</div>
      </div>

      {/* 장애인 인증 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...label, width: "88%" }}>장애인 인증하기</div>
        <input style={{ ...field, marginTop: 8, width: "88%", padding: "14px 14px", fontSize: 15 }} placeholder="복지카드 번호 입력" />
        <div style={{ display: "flex", alignItems: "center", marginTop: 8, gap: 8, width: "88%" }}>
          <div style={{ ...sub, margin: 0, flex: 1 }}>장애 등급 및 유형 인증</div>
          <button style={ghostBtn}>인증</button>
        </div>
      </div>

      {/* 자원봉사자 등록 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "88%" }}>
          <div>
            <div style={label}>자원봉사자 등록하기</div>
            <div style={sub}>지원 및 가능한 시간대 입력</div>
          </div>
          <button style={ghostBtn} onClick={onVolunteerOpen}>등록</button>
        </div>
      </div>

      {/* 이메일 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...label, width: "88%" }}>이메일</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, width: "88%" }}>
          <input style={{ ...field, flex: 1, padding: "15px 15px", fontSize: 15 }} defaultValue="bustagosipda" />
          <input style={{ ...field, width: 110, padding: "15px 15px", fontSize: 15 }} defaultValue="@naver.com" />
        </div>
      </div>

      {/* 생년월일 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...label, width: "88%" }}>생년월일</div>
        <input style={{ ...field, marginTop: 8, width: "88%", padding: "14px 14px", fontSize: 15 }} defaultValue="2005. 12. 21" />
      </div>

      {/* 아이디 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...label, width: "88%" }}>아이디</div>
        <input
          style={{ ...field, marginTop: 8, width: "88%", padding: "14px 14px", fontSize: 15 }}
          value={idValue}
          onChange={(e) => onChangeId(e.target.value)}
          placeholder="아이디 입력"
        />
      </div>

      {/* 비밀번호 */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...label, width: "88%" }}>비밀번호</div>
        <input
          style={{ ...field, marginTop: 8, width: "88%", padding: "14px 14px", fontSize: 15 }}
          type="password"
          value={pwValue}
          onChange={(e) => onChangePw(e.target.value)}
          placeholder="비밀번호 입력"
        />
      </div>

      {/* 다음 버튼 */}
      <div style={{ height: 16 }} />
      <button
        style={{ ...primaryBtn, opacity: idValue && pwValue ? 0.95 : 0.5, width: "88%", height: 52, fontSize: 17, margin: "0 auto", display: "block", borderRadius: 14 }}
        onClick={() => (idValue && pwValue ? onDone() : alert("아이디/비밀번호를 입력해 주세요"))}
        disabled={!idValue || !pwValue}
      >
        다음
      </button>
    </div>
  );
}

/* 3. 회원가입 – 자원봉사자 등록 (모달 시트) */
function VolunteerSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [region, setRegion] = useState<string>("대전광역시 서구");
  const [cert, setCert] = useState<string>("없음");
  const [file, setFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);

  const toggleTime = (t: string) =>
    setTimeSlots((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const ready = agree && (cert !== "자격증 업로드" || !!file) && timeSlots.length > 0;

  return (
    <>
      <div style={dim} onClick={onClose} />
      <div style={sheet}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 999, background: "#e5e7eb", margin: "10px 0" }} />
        </div>
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>자원봉사자 등록하기</div>

          <div style={box}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>프로필 설정</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={avatar}>👤</div>
              <input style={{ ...field, flex: 1 }} placeholder="닉네임 (선택)" />
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>봉사자 유형 선택</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["일반 봉사자", "동행 지원", "운전 지원"].map((t) => (
                <Tag key={t} text={t} />
              ))}
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>활동 가능 지역</div>
            <select style={field} value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>대전광역시 서구</option>
              <option>대전광역시 중구</option>
              <option>대전광역시 유성구</option>
              <option>대전광역시 대덕구</option>
              <option>대전광역시 동구</option>
            </select>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>활동 가능 시간</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["09:00", "10:00", "13:00", "15:00", "18:00", "21:00"].map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTime(t)}
                  style={{
                    ...tagBtn,
                    background: timeSlots.includes(t) ? "#e0e7ff" : "#fff",
                    borderColor: timeSlots.includes(t) ? "#6366f1" : "#e5e7eb",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>자격증 / 인증</div>
            <select style={field} value={cert} onChange={(e) => setCert(e.target.value)}>
              <option>없음</option>
              <option>자격증 업로드</option>
            </select>
            {cert === "자격증 업로드" && (
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginTop: 8 }} />
            )}
          </div>

          <div style={{ ...box, display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <div>AI 매칭 서비스 동의</div>
          </div>

          <button style={{ ...primaryBtn, marginTop: 4, opacity: ready ? 1 : 0.5 }} disabled={!ready} onClick={onSubmit}>
            등록 완료
          </button>
        </div>
      </div>
    </>
  );
}

/* 4. 회원가입2 */
function Signup2({ onNext }: { onNext: () => void }) {
  return (
    <div style={screen}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={title}>[ 회원 가입 ]</h1>
        <div style={{ marginLeft: "auto", opacity: 0.6 }}>🎙️</div>
      </div>
      <div style={{ color: "#9aa0a6", fontSize: 12, margin: "6px 0 12px" }}>✍️ 음성 입력 지원 (Whisper AI)</div>

      <div style={{ marginTop: 6 }}>
        <div style={label}>전화번호</div>
        <input style={{ ...field, marginTop: 6 }} defaultValue="010 - 1234 - 5678" />
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={label}>인증번호 입력</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input style={{ ...field, flex: 1 }} defaultValue="347891" />
          <button style={ghostBtn}>재전송</button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={label}>서비스 유형 선택</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {["교통 약자", "보호자", "일반"].map((t) => (
            <Tag key={t} text={t} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" /> 이용약관 및 개인정보 동의
        </label>
      </div>

      <button style={{ ...primaryBtn, marginTop: 16 }} onClick={onNext}>
        완료
      </button>
    </div>
  );
}

/* 5. 로그인 (회원가입 값과 비교) */
function Login({
  expectedId,
  expectedPw,
  onSuccess,
}: {
  expectedId: string;
  expectedPw: string;
  onSuccess: () => void;
}) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expectedId || !expectedPw) {
      setErr("먼저 회원가입에서 아이디/비밀번호를 설정해 주세요.");
      return;
    }
    if (id === expectedId && pw === expectedPw) {
      setErr(null);
      onSuccess();
    } else {
      setErr("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div
      style={{
        ...screen,
        height: 852 - 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 900 }}>Bus - ing</div>
      <div style={{ color: "#111827", fontWeight: 800 }}>로그인</div>

      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ ...loginCard, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: "88%" }}>
            <div style={{ ...label, marginBottom: 6 }}>아이디</div>
            <input
              style={{ ...field, width: "92%", padding: "14px 14px", display: "block", margin: "0 auto" }}
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div style={{ width: "88%" }}>
            <div style={{ ...label, marginBottom: 6 }}>비밀번호</div>
            <input
              style={{ ...field, width: "92%", padding: "14px 14px", display: "block", margin: "0 auto" }}
              placeholder="비밀번호"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div style={{ width: "88%", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{err}</div>}

          <button type="submit" style={{ ...primaryBtn, marginTop: 14, width: "88%", height: 52, fontSize: 17, borderRadius: 14 }}>
            로그인
          </button>
        </div>
      </form>

      <div style={{ fontSize: 54, marginTop: 10 }}>🌲 🚌 ♿</div>
    </div>
  );
}

/* -------------------- 홈 & 기능 화면 -------------------- */

/** 홈 (버튼 → 각 페이지로 이동) */
function Home({ onGo }: { onGo: (p: Page) => void }) {
  const Btn = ({
    icon,
    text,
    to,
  }: {
    icon: string;
    text: string;
    to: Page;
  }) => (
    <button
      onClick={() => onGo(to)}
      style={{
        width: "100%",
        padding: "18px 20px",
        borderRadius: 24,
        border: "1px solid #e5e7eb",
        background: "#fff",
        boxShadow: "0 6px 16px rgba(0,0,0,.08)",
        fontWeight: 800,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span> {text}
    </button>
  );

  return (
    <div style={{ ...screen, height: 852 - 52, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div style={{ fontSize: 40, fontWeight: 900 }}>Bus-ing</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
        <Btn icon="🚌" text="대중교통 이용하기" to="transit" />
        <Btn icon="📞" text="자원봉사자 호출장" to="volunteerCall" />
        <Btn icon="📷" text="장애물 제보하기" to="reportObstacle" />
        <Btn icon="🗺️" text="주변 장애물 지도 보기" to="mapNearby" />
        <Btn icon="👤" text="내 정보" to="profile" />
        <Btn icon="🤖" text="Bus-ing AI" to="ai" />
      </div>
    </div>
  );
}

/** 화면 공통 프레임 (상단 뒤로가기/제목) */
function ScreenFrame({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...screen, height: 852 - 52 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ ...ghostBtn, padding: "8px 12px" }}>← 뒤로</button>
        <div style={{ margin: "0 auto", fontWeight: 900, fontSize: 18 }}>{title}</div>
        <div style={{ width: 72 }} />
      </div>
      <div style={{ height: "calc(100% - 52px)", overflowY: "auto" }}>{children}</div>
    </div>
  );
}

/** --- 각 기능 화면(임시 내용/연결만) --- */
function TransitScreen() {
  return <div>저상버스/지하철 선택 · 실시간 도착정보(연동 예정)</div>;
}
function VolunteerCallScreen() {
  return <div>가까운 자원봉사자 찾기 · 시간대 선택 · 호출 확인(연동 예정)</div>;
}
function ReportObstacleScreen() {
  return <div>카메라 촬영/갤러리 업로드 · 위치 자동기록 · 유형 선택(연동 예정)</div>;
}
/* --- 주변 장애물 지도 화면 (마커 클릭 → 상세 시트) --- */
function MapNearbyScreen() {
  type VoteKind = "exists" | "resolved" | "wrong";
  type Obstacle = {
    id: string;
    title: string;
    category: "공사/작업 중" | "불법주정차" | "파손/파임" | "기타";
    desc: string;
    photoUrl?: string;
    reportedAt: number;    // epoch ms
    // 데모용 좌표(실지도 X) - 박스 내 상대 좌표
    x: number; // 0~100 (%)
    y: number; // 0~100 (%)
    votes: { exists: number; resolved: number; wrong: number };
  };

  // 초기 더미 데이터
  const seed: Obstacle[] = [
    {
      id: "obs-101",
      title: "보행로 절개 공사",
      category: "공사/작업 중",
      desc: "보행로가 완전히 막혀 휠체어 우회 필요. 인도로는 통행 불가.",
      photoUrl:
        "https://images.unsplash.com/photo-1541976076758-347942db1976?q=80&w=1200&auto=format&fit=crop",
      reportedAt: Date.now() - 1000 * 60 * 60 * 26,
      x: 22,
      y: 30,
      votes: { exists: 8, resolved: 1, wrong: 0 },
    },
    {
      id: "obs-102",
      title: "보도블록 파손",
      category: "파손/파임",
      desc: "바퀴가 걸릴 정도의 균열. 야간 시 특히 위험.",
      photoUrl:
        "https://images.unsplash.com/photo-1569228269719-646b9eaf2ffe?q=80&w=1200&auto=format&fit=crop",
      reportedAt: Date.now() - 1000 * 60 * 60 * 6,
      x: 63,
      y: 48,
      votes: { exists: 5, resolved: 0, wrong: 1 },
    },
    {
      id: "obs-103",
      title: "횡단보도 불법주정차",
      category: "불법주정차",
      desc: "보행신호 시 통행 간섭 발생. 사진+번호판 포함 제보 다수.",
      photoUrl:
        "https://images.unsplash.com/photo-1518306727298-4c17e1bf694a?q=80&w=1200&auto=format&fit=crop",
      reportedAt: Date.now() - 1000 * 60 * 90,
      x: 80,
      y: 72,
      votes: { exists: 3, resolved: 2, wrong: 0 },
    },
  ];

  // 저장/복원 (투표/메모)
  const [storeKey] = useState("busing.obstacles.v1");
  const [obstacles, setObstacles] = useState<Obstacle[]>(() => {
    const raw = localStorage.getItem(storeKey);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return seed;
  });
  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(obstacles));
  }, [obstacles, storeKey]);

  const [selected, setSelected] = useState<Obstacle | null>(null);
  const [picked, setPicked] = useState<VoteKind | null>(null);
  const [memo, setMemo] = useState("");

  const closeSheet = () => {
    setSelected(null);
    setPicked(null);
    setMemo("");
  };

  const submitVote = () => {
    if (!selected || !picked) {
      alert("상태를 선택해 주세요.");
      return;
    }
    setObstacles((prev) =>
      prev.map((o) =>
        o.id === selected.id
          ? {
              ...o,
              votes: { ...o.votes, [picked]: o.votes[picked] + 1 },
            }
          : o
      )
    );
    // (선택) 메모를 따로 저장하고 싶으면 selected.id 기반으로 로컬 저장
    if (memo.trim()) {
      localStorage.setItem(`busing.memo.${selected.id}`, memo.trim());
    }
    alert("신뢰도 평가가 반영되었습니다. 고마워요!");
    closeSheet();
  };

  const fmt = (t: number) => {
    const d = new Date(t);
    const date = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
    const time = d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  };

  return (
    <div style={{ ...screen, padding: 0, height: 852 - 52, position: "relative" }}>
      {/* 가짜 지도 박스(실 서비스에선 네이버지도 영역으로 교체) */}
      <div style={mapBox}>
        {/* 마커들 렌더 */}
        {obstacles.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o)}
            aria-label={`${o.title} 마커`}
            style={{
              ...markerBtn,
              left: `${o.x}%`,
              top: `${o.y}%`,
              transform: "translate(-50%, -100%)",
            }}
            title={o.title}
          >
            ▲
          </button>
        ))}

        {/* 선택 시 말풍선 안내 (스크린샷 느낌) */}
        {selected && (
          <div
            style={{
              position: "absolute",
              left: `${selected.x}%`,
              top: `${selected.y}%`,
              transform: "translate(-50%, -140%)",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
              padding: "10px 12px",
              fontWeight: 700,
              fontSize: 13.5,
              maxWidth: 260,
            }}
          >
            이 위치에서 이 장애물을 발견하셨나요?
            <br />
            신뢰도 평가 후 3점을 획득하세요!
          </div>
        )}
      </div>

      {/* 하단 시트: 장애물 상세 & 신뢰도 평가 */}
      {selected && (
        <>
          <div style={dim} onClick={closeSheet} />
          <div style={detailSheet}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
              <div style={{ width: 48, height: 5, borderRadius: 999, background: "#e5e7eb" }} />
            </div>

            {/* 카드 */}
            <div style={detailCard}>
              <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠️</span> 장애물 정보
              </div>

              <div style={{ overflow: "hidden", borderRadius: 12, border: "1px solid #eee" }}>
                <img
                  src={selected.photoUrl}
                  alt={selected.title}
                  style={{ display: "block", width: "100%", height: 160, objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, marginTop: 12 }}>
                <InfoPill label="제보날짜" value={fmt(selected.reportedAt).date} />
                <InfoPill label="제보시간" value={fmt(selected.reportedAt).time} />
                <InfoPill label="분류" value={selected.category} />
                <InfoPill label="추가정보" value={selected.desc} multiline />
              </div>
            </div>

            {/* 질문 */}
            <div style={{ fontWeight: 900, fontSize: 16, margin: "10px 2px 8px" }}>
              현재 이 위치에서 해당 장애물을 발견하셨나요?
            </div>

            {/* 빠른 선택칩 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <Chip
                text={`여전히 존재 (${selected.votes.exists})`}
                active={picked === "exists"}
                onClick={() => setPicked("exists")}
              />
              <Chip
                text={`이미 해결 (${selected.votes.resolved})`}
                active={picked === "resolved"}
                onClick={() => setPicked("resolved")}
              />
              <Chip
                text={`잘못된 정보 (${selected.votes.wrong})`}
                active={picked === "wrong"}
                onClick={() => setPicked("wrong")}
              />
            </div>

            {/* 메모 입력 (선택) */}
            <div style={{ position: "relative" }}>
              <input
                style={memoInput}
                placeholder="추가로 발견한 불편한 사항이 있나요? 입력하기..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              <div style={{ position: "absolute", right: 14, top: 10, opacity: 0.5 }}>🎙️</div>
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={cancelBtn} onClick={closeSheet}>취소</button>
              <button style={submitBtn} onClick={submitVote}>완료</button>
            </div>
          </div>
        </>
      )}

      {/* 하단 요약 배너 (스크린샷의 카드 느낌) */}
      <div style={summaryCard}>
        <div style={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚠️</span> 현위치를 바탕으로 검색
        </div>
        <div style={{ marginTop: 6, color: "#6b7280" }}>
          발견된 위험 장애물 : <b>{obstacles.length}건</b>
        </div>
        <div style={tipBubble}>
          지도에 표시되지 않은 장애물을 발견하셨나요?
          <br />
          모두의 안전을 위해 제보해주세요!
        </div>
      </div>
    </div>
  );
}

/* ---- 작은 파츠들 ---- */
function InfoPill({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <>
      <div
        style={{
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#fff",
          fontWeight: 800,
          color: "#374151",
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #eef2f7",
          background: "#f9fafb",
          whiteSpace: multiline ? "pre-wrap" : "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </>
  );
}

function Chip({ text, active, onClick }: { text: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid",
        borderColor: active ? "#6366f1" : "#e5e7eb",
        background: active ? "#e0e7ff" : "#fff",
        borderRadius: 999,
        padding: "8px 12px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}

function ProfileScreen({ savedId }: { savedId: string }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}><b>로그인 아이디:</b> {savedId || "(미설정)"}</div>
      <div>누적 포인트, 제보/봉사 횟수, 접근성 설정 등 (연동 예정)</div>
    </div>
  );
}
function AIScreen() {
  return <div>경로 추천/도움말 챗 · 음성입력(Whisper), 응답(TTS) 연동 예정</div>;
}

/* -------------------- 작은 UI -------------------- */
function Tag({ text }: { text: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      style={{
        ...tagBtn,
        background: on ? "#e0e7ff" : "#fff",
        borderColor: on ? "#6366f1" : "#e5e7eb",
      }}
    >
      {text}
    </button>
  );
}

const tagBtn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const box: React.CSSProperties = {
  border: "1px solid #ececf1",
  borderRadius: 12,
  padding: 12,
  background: "#fafafa",
  marginBottom: 10,
};

const avatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const dim: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,.35)",
};

const sheet: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  background: "#fff",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  boxShadow: "0 -10px 30px rgba(0,0,0,.18)",
};

const loginCard: React.CSSProperties = {
  width: "calc(100% - 64px)",
  maxWidth: 335,
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  background: "#fff",
  padding: 16,
  overflow: "hidden",
};

/* ---- MapNearbyScreen 전용 스타일 ---- */
const mapBox: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(0deg, rgba(255,255,255,1), rgba(255,255,255,1)), url('')",
  // 데모용 지도 느낌
  backgroundColor: "#eef2f7",
};

const markerBtn: React.CSSProperties = {
  position: "absolute",
  fontSize: 22,
  color: "#dc2626", // 빨간 마커
  textShadow: "0 1px 0 #fff",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const detailSheet: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  background: "#fff",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  boxShadow: "0 -12px 36px rgba(0,0,0,.18)",
  padding: "6px 16px 16px",
};

const detailCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 12,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,.04)",
};

const memoInput: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 999,
  padding: "10px 14px",
  outline: "none",
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  border: "1px solid #e5e7eb",
  background: "#f3f4f6",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const submitBtn: React.CSSProperties = {
  flex: 1,
  border: "1px solid #4338ca",
  background: "#4f46e5",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const summaryCard: React.CSSProperties = {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 18,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 10px 24px rgba(0,0,0,.12)",
};

const tipBubble: React.CSSProperties = {
  marginTop: 10,
  padding: "12px 14px",
  background: "#f9fafb",
  border: "1px solid #eef2f7",
  borderRadius: 12,
  fontWeight: 700,
  color: "#374151",
};
