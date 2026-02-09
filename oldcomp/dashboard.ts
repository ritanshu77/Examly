// "use client";

// import { useEffect } from "react";

// export default function DashboardShell({ user }: { user: any }) {
//   useEffect(() => {
//     // log cookies for debugging (HttpOnly cookies like `token` won't appear here)
//     try {
//       console.log("document.cookie:", document.cookie);
//     } catch (e) {
//       console.log("Could not read document.cookie", e);
//     }
//     function handleClick(event: any) {
//       const sidebar = document.getElementById("sidebar");
//       const btn = document.querySelector(".toggle-btn");
//       if (!sidebar || !btn) return;
//       if (
//         window.innerWidth <= 768 &&
//         sidebar.classList.contains("active") &&
//         !sidebar.contains(event.target) &&
//         event.target !== btn
//       ) {
//         sidebar.classList.remove("active");
//       }
//     }

//     window.addEventListener("click", handleClick);
//     return () => window.removeEventListener("click", handleClick);
//   }, []);

//   return (
//     <div>
//       <style>{`
//         .welcome-msg { margin-bottom: 25px; }
//         .welcome-msg h1 { margin: 0; color: var(--primary-blue); font-size: 1.6rem; }
//         .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; width: 100%; }
//         .stat-card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 5px solid #ccc; }
//         .card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px; width: 100%; }
//         .test-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; gap: 10px; }
//         .btn-start { background: var(--primary-blue); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; white-space: nowrap; flex-shrink: 0; }
//         .progress-bar { background: #eee; height: 8px; border-radius: 10px; overflow: hidden; margin-top: 5px; }
//       `}</style>

//       <div className="welcome-msg">
//         <h1>Welcome, {user?.name ?? "Guest"}! 👋</h1>
//         <p style={{ fontSize: 14, margin: "5px 0", color: "#666" }}>Ready for today's challenge?</p>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card" style={{ borderLeftColor: "var(--primary-blue)" }}>
//           <h3>Subject name</h3>
//           <p>subject Question Quantity</p>
//         </div>
        {/* <div className="stat-card" style={{ borderLeftColor: "var(--success-green)" }}>
          <h3>84%</h3>
          <p>Avg Score</p>
        </div> */}
        
    //   </div>

      {/* <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <span className="section-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Available Tests</span>
        <div className="card">
          <div className="test-item">
            <div>
              <div style={{ fontWeight: "bold", fontSize: 15 }}>Full Length Mock Test 02</div>
              <small style={{ color: "#888" }}>100 Qs • 90 Mins</small>
            </div>
            <a href="#" className="btn-start">Start Now</a>
          </div>
          <div className="test-item">
            <div>
              <div style={{ fontWeight: "bold", fontSize: 15 }}>DBMS Practice Set</div>
              <small style={{ color: "#888" }}>20 Qs • 15 Mins</small>
            </div>
            <a href="#" className="btn-start">Start Now</a>
          </div>
        </div>

        <span className="section-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Activity</span>
        <div className="card">
          <div style={{ marginBottom: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
              <span>Computer Networks</span>
              <b>75/100</b>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ background: "var(--success-green)", width: "75%" }}></div></div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
              <span>Data Structures</span>
              <b>90/100</b>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ background: "var(--primary-blue)", width: "90%" }}></div></div>
          </div>
        </div>
      </div> */}
//     </div>
//   );
// }
