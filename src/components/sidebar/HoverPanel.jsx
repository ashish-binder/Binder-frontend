import { Trash2 } from "lucide-react";
import { normalizeOrderType } from "../../utils/orderType";

const HoverPanel = ({
  hoveredMenu,
  setHoveredMenu,
  hoveredSubmenu,
  setHoveredSubmenu,
  hoverPanelRef,
  existingIPOs,
  existingCompanyEssentials,
  activePage,
  setActivePage,
  setCodeCreationView,
  setEditingBuyer,
  setEditingVendor,
  setSelectedIpoForCNS,
  setSelectedIpoForSpec,
  setSelectedIpoForDerivedCNS,
  requestDeleteIpo,
  setTasksView,
}) => {
  const ipoByType = (type) => {
    const normalizedType = normalizeOrderType(type);
    return existingIPOs.filter(
      (ipo) =>
        normalizeOrderType(ipo.orderType || ipo.order_type) ===
          normalizedType &&
        (ipo.ipoCode || ipo.code),
    );
  };

  const getCompanyEssentialsItems = () =>
    existingCompanyEssentials.map((entry, index) => {
      const label = entry.code || entry.poNumber || "CHD/E/.../PO-";
      return {
        key:
          entry.code || entry.poNumber || `${entry.category || "ce"}-${index}`,
        label,
      };
    });

  const getIpoItems = (orderType) => {
    const normalizedType = normalizeOrderType(orderType);
    const prefixByType = {
      Production: "CHD/PD/",
      Sampling: "CHD/SAM/",
      Company: "CHD/SELF/",
    };
    const expectedPrefix = prefixByType[normalizedType];
    return ipoByType(normalizedType)
      .filter((ipo) => {
        if (!expectedPrefix) return true;
        const code = (ipo.ipoCode || ipo.code || "").toUpperCase();
        if (code.includes("/E/")) return false;
        return code.startsWith(expectedPrefix);
      })
      .map((ipo, index) => ({
        key: ipo.ipoCode || ipo.code || `${normalizedType}-${index}`,
        label: ipo.ipoCode || ipo.code || "IPO",
      }));
  };

  const getItemsForCategory = (categoryKey, categoryType) => {
    if (categoryKey === "company-essentials") {
      return getCompanyEssentialsItems();
    }
    return getIpoItems(categoryType);
  };

  const renderHoverPanel = () => {
    if (!hoveredMenu) return null;

    if (hoveredMenu === "code-creation") {
      const activeCategory =
        hoveredSubmenu?.menu === "code-creation"
          ? hoveredSubmenu.category
          : null;
      return (
        <div
          className="hover-panel-group"
          ref={hoverPanelRef}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          <div className="hover-panel">
            <div className="hover-panel-column">
              <button
                className={`hover-panel-item ${activeCategory === "buyer" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "code-creation",
                    category: "buyer",
                  })
                }
              >
                Buyer
              </button>
              <button
                className={`hover-panel-item ${activeCategory === "vendor" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "code-creation",
                    category: "vendor",
                  })
                }
              >
                Vendor
              </button>
              <button
                className={`hover-panel-item ${activeCategory === "company-essentials" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "code-creation",
                    category: "company-essentials",
                  })
                }
              >
                Company Essentials
              </button>
              <button
                className={`hover-panel-item ${activeCategory === "internal-purchase-order" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "code-creation",
                    category: "internal-purchase-order",
                  })
                }
              >
                Internal Purchase Order
              </button>
            </div>
          </div>
          {activeCategory === "buyer" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Buyer</div>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setEditingBuyer(null);
                    setActivePage("code-creation");
                    setCodeCreationView("buyer");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Generate Buyer Code
                </button>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("buyer-existing");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Master Buyer Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === "vendor" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Vendor</div>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setEditingVendor(null);
                    setActivePage("code-creation");
                    setCodeCreationView("vendor");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Generate Vendor Code
                </button>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("vendor-existing");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Master Vendor Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === "company-essentials" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Company Essentials</div>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("company-essentials");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Generate Company Essentials Code
                </button>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("company-essentials-master");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Master Company Essentials Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === "internal-purchase-order" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Internal Purchase Order</div>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("internal-purchase-order");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Generate IPO Code
                </button>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("internal-purchase-order-master");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Master IPO Sheet
                </button>
                <button
                  className="hover-panel-item"
                  onClick={() => {
                    setActivePage("code-creation");
                    setCodeCreationView("completed-ipos");
                    setHoveredMenu(null);
                    setHoveredSubmenu(null);
                  }}
                >
                  Completed IPOs
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === "ipo-management") {
      const categories = [
        { label: "Company", key: "Company" },
        { label: "Production", key: "Production" },
        { label: "Sampling", key: "Sampling" },
      ];
      const activeCategory =
        hoveredSubmenu?.menu === "ipo-management"
          ? hoveredSubmenu.category
          : null;
      const activeIpoCode =
        hoveredSubmenu?.menu === "ipo-management"
          ? hoveredSubmenu.ipoCode
          : null;
      const items = activeCategory ? ipoByType(activeCategory) : [];
      const activeIpo = activeIpoCode
        ? items.find((i) => (i.ipoCode || i.code) === activeIpoCode)
        : null;

      const openIpoLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForCNS(null);
        setSelectedIpoForDerivedCNS(null);
        setSelectedIpoForSpec({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ""),
        });
        setActivePage("ipo-management");
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      const openCnsLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForSpec(null);
        setSelectedIpoForDerivedCNS(null);
        setSelectedIpoForCNS({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ""),
        });
        setActivePage("ipo-management");
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      const openDerivedCnsLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForSpec(null);
        setSelectedIpoForCNS(null);
        setSelectedIpoForDerivedCNS({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ""),
        });
        setActivePage("ipo-management");
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      return (
        <div
          className="hover-panel-group"
          ref={hoverPanelRef}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">IPO Type</div>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`hover-panel-item ${activeCategory === cat.key ? "active" : ""}`}
                  onMouseEnter={() =>
                    setHoveredSubmenu({
                      menu: "ipo-management",
                      category: cat.key,
                    })
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {activeCategory && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">
                  {categories.find((c) => c.key === activeCategory)?.label}
                </div>
                {items.length === 0 ? (
                  <div className="hover-panel-subitem muted">No IPOs</div>
                ) : (
                  items.map((ipo) => {
                    const code = ipo.ipoCode || ipo.code;
                    return (
                      <button
                        key={code}
                        type="button"
                        className={`hover-panel-item ${activeIpoCode === code ? "active" : ""}`}
                        onMouseEnter={() =>
                          setHoveredSubmenu({
                            menu: "ipo-management",
                            category: activeCategory,
                            ipoCode: code,
                          })
                        }
                      >
                        {code}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeIpo && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">
                  {activeIpo.ipoCode || activeIpo.code}
                </div>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openIpoLeaf(activeIpo)}
                >
                  IPC Spec
                </button>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openDerivedCnsLeaf(activeIpo)}
                >
                  IPC Derived CNS
                </button>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openCnsLeaf(activeIpo)}
                >
                  IPO Master CNS
                </button>
                <button
                  type="button"
                  className="hover-panel-item hover-panel-item--danger"
                  onClick={() => requestDeleteIpo(activeIpo)}
                >
                  <Trash2
                    size={14}
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />
                  Delete IPO
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === "purchase") {
      const categories = [
        { label: "Production", key: "Production" },
        { label: "Sampling", key: "Sampling" },
        { label: "Company Essentials", key: "Company" },
      ];
      const activeCategory =
        hoveredSubmenu?.menu === "purchase" ? hoveredSubmenu.category : null;
      const items = activeCategory ? ipoByType(activeCategory) : [];
      return (
        <div
          className="hover-panel-group"
          ref={hoverPanelRef}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">Purchase</div>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`hover-panel-item ${activeCategory === cat.key ? "active" : ""}`}
                  onMouseEnter={() =>
                    setHoveredSubmenu({ menu: "purchase", category: cat.key })
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {activeCategory && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">
                  {categories.find((c) => c.key === activeCategory)?.label}
                </div>
                {items.map((ipo) => (
                  <div key={ipo.ipoCode} className="hover-panel-subitem">
                    {ipo.ipoCode}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="hover-panel-subitem muted">No IPOs</div>
                )}
                {activeCategory === "Company" && (
                  <button
                    className="hover-panel-action"
                    onClick={() => {
                      setActivePage("code-creation");
                      setCodeCreationView("generate-po");
                      setHoveredMenu(null);
                    }}
                  >
                    Generate PO
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === "ims") {
      const categories = [
        { label: "Production", key: "production", type: "Production" },
        { label: "Sampling", key: "sampling", type: "Sampling" },
        {
          label: "Company Essentials",
          key: "company-essentials",
          type: "Company Essentials",
        },
        { label: "Company", key: "company", type: "Company" },
      ];
      const actionsBySection = {
        inward: { key: "receive", label: "Receive Challan" },
        outward: { key: "generate", label: "Generate Challan" },
      };
      const activeSection =
        hoveredSubmenu?.menu === "ims" ? hoveredSubmenu.section : null;
      const activeAction =
        hoveredSubmenu?.menu === "ims" ? hoveredSubmenu.action : null;
      const activeCategory =
        hoveredSubmenu?.menu === "ims" ? hoveredSubmenu.category : null;
      const activeCategoryMeta = categories.find(
        (cat) => cat.key === activeCategory,
      );
      const items = activeCategory
        ? getItemsForCategory(activeCategory, activeCategoryMeta?.type)
        : [];
      return (
        <div
          className="hover-panel-group"
          ref={hoverPanelRef}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">IMS</div>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === "inward" || ["inward-store-sheet", "inward-store-sheet-db"].includes(activePage) ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "ims",
                    section: "inward",
                    action: null,
                    category: null,
                  })
                }
              >
                Inward Store Logs
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === "outward" || ["outward-store-sheet", "outward-store-sheet-db"].includes(activePage) ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "ims",
                    section: "outward",
                    action: null,
                    category: null,
                  })
                }
              >
                Outward Store Logs
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === "stock" || ["stock-sheet", "stock-sheet-db"].includes(activePage) ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "ims",
                    section: "stock",
                    action: null,
                    category: null,
                  })
                }
              >
                Stock Sheet
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === "uqr" || activePage === "uqr-forms" || activePage === "uqr-database" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "ims",
                    section: "uqr",
                    action: null,
                    category: null,
                  })
                }
              >
                UQR
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === "courier" || activePage === "courier-slip" || activePage === "courier-master" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "ims",
                    section: "courier",
                    action: null,
                    category: null,
                  })
                }
              >
                Courier
              </button>
            </div>
          </div>
          {activeSection === "inward" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Inward Store Logs</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "inward-store-sheet" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("inward-store-sheet");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Inward Store Logs Form
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "inward-store-sheet-db" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("inward-store-sheet-db");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Inward Store Logs Database
                </button>
              </div>
            </div>
          )}
          {activeSection === "outward" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Outward Store Logs</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "outward-store-sheet" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("outward-store-sheet");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Outward Store Log Form
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "outward-store-sheet-db" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("outward-store-sheet-db");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Outward Store Logs Database
                </button>
              </div>
            </div>
          )}
          {activeSection === "stock" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Stock Sheet</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "stock-sheet" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("stock-sheet");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Add Stock Items
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "stock-sheet-db" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("stock-sheet-db");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Master Stock Logs
                </button>
              </div>
            </div>
          )}
          {activeSection === "uqr" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">UQR</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "uqr-forms" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("uqr-forms");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  UQR Forms
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "uqr-database" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("uqr-database");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  UQR Database
                </button>
              </div>
            </div>
          )}
          {activeSection === "courier" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Courier</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "courier-slip" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("courier-slip");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Courier Slip
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === "courier-master" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("courier-master");
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Master Courier Sheet
                </button>
              </div>
            </div>
          )}
          {activeSection &&
            activeSection !== "uqr" &&
            activeSection !== "courier" &&
            activeSection !== "inward" &&
            activeSection !== "outward" &&
            activeSection !== "stock" && (
              <div className="hover-panel nested-panel">
                <div className="hover-panel-column">
                  <div className="hover-panel-title">
                    {activeSection === "inward"
                      ? "Inward Store Logs"
                      : "Outward Store Logs"}
                  </div>
                  <button
                    key={`${activeSection}-${actionsBySection[activeSection]?.key}`}
                    type="button"
                    className={`hover-panel-item ${activeAction === actionsBySection[activeSection]?.key ? "active" : ""}`}
                    onMouseEnter={() =>
                      setHoveredSubmenu({
                        menu: "ims",
                        section: activeSection,
                        action: actionsBySection[activeSection]?.key,
                        category: null,
                      })
                    }
                  >
                    {actionsBySection[activeSection]?.label}
                  </button>
                </div>
              </div>
            )}
          {activeAction &&
            activeSection !== "uqr" &&
            activeSection !== "courier" &&
            activeSection !== "inward" &&
            activeSection !== "outward" &&
            activeSection !== "stock" && (
              <div className="hover-panel nested-panel second">
                <div className="hover-panel-column">
                  <div className="hover-panel-title">Select Type</div>
                  {categories.map((cat) => (
                    <button
                      key={`${activeSection}-${cat.key}`}
                      type="button"
                      className={`hover-panel-item ${activeCategory === cat.key ? "active" : ""}`}
                      onMouseEnter={() =>
                        setHoveredSubmenu({
                          menu: "ims",
                          section: activeSection,
                          action: activeAction,
                          category: cat.key,
                        })
                      }
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          {activeCategory &&
            activeSection !== "uqr" &&
            activeSection !== "courier" &&
            activeSection !== "inward" &&
            activeSection !== "outward" &&
            activeSection !== "stock" && (
              <div className="hover-panel nested-panel third">
                <div className="hover-panel-column">
                  <div className="hover-panel-title">
                    {activeCategoryMeta?.label}
                  </div>
                  {items.map((item) => (
                    <div
                      key={`${activeSection}-${activeCategory}-${item.key}`}
                      className="hover-panel-subitem"
                    >
                      {item.label}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="hover-panel-subitem muted">No PO codes</div>
                  )}
                </div>
              </div>
            )}
        </div>
      );
    }

    if (hoveredMenu === "tasks") {
      const poTypes = [
        { label: "Production", key: "production", type: "Production" },
        { label: "Sampling", key: "sampling", type: "Sampling" },
        { label: "Company", key: "company", type: "Company" },
      ];
      const departments = ["Department 1", "Department 2", "Department 3"];
      const users = ["User 1", "User 2", "User 3"];
      const priorities = ["Low", "Medium", "High", "Urgent"];

      const activeAction =
        hoveredSubmenu?.menu === "tasks" ? hoveredSubmenu.action : null;
      const activeType =
        hoveredSubmenu?.menu === "tasks" ? hoveredSubmenu.type : null;
      const activeIpo =
        hoveredSubmenu?.menu === "tasks" ? hoveredSubmenu.ipo : null;
      const activeDepartment =
        hoveredSubmenu?.menu === "tasks" ? hoveredSubmenu.department : null;
      const activeUser =
        hoveredSubmenu?.menu === "tasks" ? hoveredSubmenu.user : null;

      const activeTypeMeta = poTypes.find((t) => t.key === activeType);
      const ipoItems = activeTypeMeta ? getIpoItems(activeTypeMeta.type) : [];

      return (
        <div
          className="hover-panel-group"
          ref={hoverPanelRef}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">Tasks</div>
              <button
                type="button"
                className={`hover-panel-item ${activeAction === "assigned" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "tasks",
                    action: "assigned",
                    type: null,
                    ipo: null,
                    department: null,
                    user: null,
                  })
                }
                onClick={() => {
                  setTasksView("assigned");
                  setActivePage("tasks");
                  setHoveredMenu(null);
                }}
              >
                Tasks Assigned To You
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeAction === "assign" ? "active" : ""}`}
                onMouseEnter={() =>
                  setHoveredSubmenu({
                    menu: "tasks",
                    action: "assign",
                    type: null,
                    ipo: null,
                    department: null,
                    user: null,
                  })
                }
                onClick={() => {
                  setTasksView("assign");
                  setActivePage("tasks");
                  setHoveredMenu(null);
                }}
              >
                Assign Tasks
              </button>
            </div>
          </div>

          {activeAction === "assign" && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select PO Type</div>
                {poTypes.map((po) => (
                  <button
                    key={po.key}
                    type="button"
                    className={`hover-panel-item ${activeType === po.key ? "active" : ""}`}
                    onMouseEnter={() =>
                      setHoveredSubmenu({
                        menu: "tasks",
                        action: activeAction,
                        type: po.key,
                        ipo: null,
                        department: null,
                        user: null,
                      })
                    }
                  >
                    {po.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeType && (
            <div className="hover-panel nested-panel second">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select IPO</div>
                {ipoItems.map((ipo) => (
                  <button
                    key={ipo.key}
                    type="button"
                    className={`hover-panel-item ${activeIpo === ipo.key ? "active" : ""}`}
                    onMouseEnter={() =>
                      setHoveredSubmenu({
                        menu: "tasks",
                        action: activeAction,
                        type: activeType,
                        ipo: ipo.key,
                        department: null,
                        user: null,
                      })
                    }
                  >
                    {ipo.label}
                  </button>
                ))}
                {ipoItems.length === 0 && (
                  <div className="hover-panel-subitem muted">No IPOs</div>
                )}
              </div>
            </div>
          )}

          {activeIpo && (
            <div className="hover-panel nested-panel third">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select Department</div>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    className={`hover-panel-item ${activeDepartment === dept ? "active" : ""}`}
                    onMouseEnter={() =>
                      setHoveredSubmenu({
                        menu: "tasks",
                        action: activeAction,
                        type: activeType,
                        ipo: activeIpo,
                        department: dept,
                        user: null,
                      })
                    }
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeDepartment && (
            <div className="hover-panel nested-panel fourth">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Users</div>
                {users.map((user) => (
                  <button
                    key={user}
                    type="button"
                    className={`hover-panel-item ${activeUser === user ? "active" : ""}`}
                    onMouseEnter={() =>
                      setHoveredSubmenu({
                        menu: "tasks",
                        action: activeAction,
                        type: activeType,
                        ipo: activeIpo,
                        department: activeDepartment,
                        user,
                      })
                    }
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeUser && (
            <div className="hover-panel nested-panel fifth">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Define Task</div>
                <input
                  className="hover-panel-input"
                  placeholder="Define task"
                />
                <input
                  className="hover-panel-input"
                  placeholder="Add sub task"
                />
                <input className="hover-panel-input" placeholder="Remarks" />
                <input className="hover-panel-input" placeholder="Due date" />
                <div className="hover-panel-subtitle">Priority</div>
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    className="hover-panel-subitem"
                  >
                    {priority}
                  </button>
                ))}
                <button type="button" className="hover-panel-action">
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return renderHoverPanel();
};

export default HoverPanel;
