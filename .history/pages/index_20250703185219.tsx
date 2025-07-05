// ...all imports unchanged...
import { useRouter } from "next/router";
import BusinessCarousel from "@/components/BusinessCarousel";
import { Info } from "lucide-react";
// ...other imports...

// Add state for mediaByDepartment
const [mediaByDepartment, setMediaByDepartment] = useState<{ [key: string]: any[] }>({});

// Fetch media for each department from Supabase on mount:
useEffect(() => {
  const fetchMedia = async () => {
    const { data, error } = await supabase.from("department_media").select("*");
    if (error) {
      setMediaByDepartment({});
      return;
    }
    const grouped: { [key: string]: any[] } = {};
    data.forEach((m: any) => {
      if (!grouped[m.department]) grouped[m.department] = [];
      grouped[m.department].push(m);
    });
    setMediaByDepartment(grouped);
  };
  fetchMedia();
}, []);
{/* RIGHT PANEL - Business Suite/Departments */}
{(windowWidth >= 800 || activePanel === "right") && (
  <motion.div
    initial={{ opacity: 0, x: 60 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 60 }}
    transition={{ duration: 0.4, type: "spring", stiffness: 90, damping: 20 }}
    style={{ flex: 1, padding: 20, display: windowWidth < 800 && activePanel !== "right" ? "none" : "block" }}
  >
    <h2>Company Suite</h2>
    {[
      { label: "Art", key: "art", path: "/business/art", desc: "Art, AGX, Onboarding, Wallet" },
      { label: "Entertainment", key: "entertainment", path: "/business/entertainment", desc: "Live Shows, Music, Venues" },
      { label: "Cuisine", key: "cuisine", path: "/business/cuisine", desc: "Restaurants, Food Delivery, Catering" },
      { label: "Fashion", key: "fashion", path: "/business/fashion", desc: "Design, Modeling, Retail" },
      { label: "Health & Fitness", key: "health", path: "/business/health", desc: "Health, Wellness, Fitness" },
      { label: "Science & Tech", key: "science", path: "/business/science", desc: "Tech, R&D, Consulting" },
      { label: "Community Clipboard", key: "community", path: "/business/community", desc: "Volunteer, Events, Forum" },
    ].map((dept, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.025, y: -4, boxShadow: "0 6px 40px #0af5" }}
        onMouseEnter={() => setHoveredDept(dept.label)}
        onMouseLeave={() => setHoveredDept(null)}
        style={{
          marginBottom: 18,
          padding: 16,
          background: "#232a39",
          borderRadius: 12,
          cursor: "pointer",
          boxShadow: "0 1px 6px #0af1",
          position: "relative",
          minHeight: 120,
          transition: "background 0.22s, box-shadow 0.22s"
        }}
        onClick={() => router.push(dept.path)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3 style={{ flex: 1, margin: 0 }}>{dept.label}</h3>
          {dept.label === "Art" && (
            <div style={{ marginLeft: 12, position: "relative", zIndex: 8 }}>
              <Info size={22} color="#2ff6a8" style={{ verticalAlign: "middle", cursor: "pointer" }}
                onClick={e => {
                  e.stopPropagation();
                  router.push("/business/art?about=1");
                }}
              />
            </div>
          )}
        </div>
        <p style={{ margin: "2px 0 0 0", opacity: 0.78 }}>{dept.desc}</p>
        {/* DEPARTMENT CAROUSEL */}
        <div style={{ marginTop: 16 }}>
          <BusinessCarousel
            department={dept.key}
            aiPick={false}
            media={mediaByDepartment[dept.key] || []}
          />
        </div>
        {/* Info box on hover (Art only) */}
        {dept.label === "Art" && hoveredDept === "Art" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: "absolute",
              right: 28,
              top: 8,
              background: "#151a21",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 14,
              boxShadow: "0 2px 18px #0af2",
              maxWidth: 300,
              zIndex: 20
            }}
          >
            the art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
          </motion.div>
        )}
      </motion.div>
    ))}
  </motion.div>
)}
      {/* RIGHT PANEL - Business Suite/Departments */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 90, damping: 20 }}
          style={{ flex: 1, padding: 20, display: windowWidth < 800 && activePanel !== "right" ? "none" : "block" }}
        >
          <h2>Company Suite</h2>
          {[
            { label: "Art", key: "art", path: "/business/art", desc: "Art, AGX, Onboarding, Wallet" },
            { label: "Entertainment", key: "entertainment", path: "/business/entertainment", desc: "Live Shows, Music, Venues" },
            { label: "Cuisine", key: "cuisine", path: "/business/cuisine", desc: "Restaurants, Food Delivery, Catering" },
            { label: "Fashion", key: "fashion", path: "/business/fashion", desc: "Design, Modeling, Retail" },
            { label: "Health & Fitness", key: "health", path: "/business/health", desc: "Health, Wellness, Fitness" },
            { label: "Science & Tech", key: "science", path: "/business/science", desc: "Tech, R&D, Consulting" },
            { label: "Community Clipboard", key: "community", path: "/business/community", desc: "Volunteer, Events, Forum" },
          ].map((dept, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 6px 40px #0af5" }}
              onMouseEnter={() => setHoveredDept(dept.label)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                marginBottom: 18,
                padding: 16,
                background: "#232a39",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 1px 6px #0af1",
                position: "relative",
                minHeight: 120,
                transition: "background 0.22s, box-shadow 0.22s"
              }}
              onClick={() => router.push(dept.path)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 style={{ flex: 1, margin: 0 }}>{dept.label}</h3>
                {dept.label === "Art" && (
                  <div style={{ marginLeft: 12, position: "relative", zIndex: 8 }}>
                    <Info size={22} color="#2ff6a8" style={{ verticalAlign: "middle", cursor: "pointer" }}
                      onClick={e => {
                        e.stopPropagation();
                        router.push("/business/art?about=1");
                      }}
                    />
                  </div>
                )}
              </div>
              <p style={{ margin: "2px 0 0 0", opacity: 0.78 }}>{dept.desc}</p>
              {/* DEPARTMENT CAROUSEL */}
              <div style={{ marginTop: 16 }}>
                <BusinessCarousel
                  department={dept.key}
                  aiPick={false}
                  media={mediaByDepartment?.[dept.key] || []}
                />
              </div>
              {/* Info box on hover (Art only) */}
              {dept.label === "Art" && hoveredDept === "Art" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: "absolute",
                    right: 28,
                    top: 8,
                    background: "#151a21",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontSize: 14,
                    boxShadow: "0 2px 18px #0af2",
                    maxWidth: 300,
                    zIndex: 20
                  }}
                >
                  the art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
