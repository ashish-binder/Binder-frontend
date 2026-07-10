import { useState } from "react";
import IpoCascadingPicker from "./purchase/IpoCascadingPicker";
import PurchaseMasterCnsSheet from "./purchase/PurchaseMasterCnsSheet";
import { VpoHistory } from "./purchase/vpo";

// Top-level Purchase route. Three views:
//   'picker'     → cascading IPO Type → IPO list
//   'sheet'      → Purchase Master CNS Sheet for the selected IPO
//   'vpo_history'→ VPO history list for the selected IPO

const PurchaseContent = () => {
  const [view, setView] = useState("picker");
  const [selectedIpo, setSelectedIpo] = useState(null);

  if (view === "sheet" && selectedIpo) {
    return (
      <PurchaseMasterCnsSheet
        ipo={selectedIpo}
        onBack={() => {
          setSelectedIpo(null);
          setView("picker");
        }}
        onOpenVpoHistory={() => setView("vpo_history")}
      />
    );
  }

  if (view === "vpo_history" && selectedIpo) {
    return (
      <VpoHistory
        ipoId={selectedIpo.id}
        ipoCode={selectedIpo.ipo_code}
        onBack={() => setView("sheet")}
      />
    );
  }

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title p-4">Purchase</h1>
      <div style={{ marginTop: 16 }}>
        <IpoCascadingPicker
          onSelectIpo={(ipo) => {
            setSelectedIpo(ipo);
            setView("sheet");
          }}
        />
      </div>
    </div>
  );
};

export default PurchaseContent;
