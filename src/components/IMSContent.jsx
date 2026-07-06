import React from "react";

const IMSContent = ({ onOpenInwardStoreSheet, onOpenStockSheet }) => {
  return (
    <div className="fullscreen-content">
      <div className="content-header">
        <h1 className="fullscreen-title">Inventory Management System (IMS)</h1>
        <p className="fullscreen-description">
          Manage your inventory with inward, outward and stock sheets
        </p>
      </div>

      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={onOpenInwardStoreSheet}
        >
          <div className="button-content">
            <span className="button-title">INWARD STORE LOGS</span>
            <span className="button-subtitle">
              Track and manage incoming inventory
            </span>
          </div>
        </button>

        <button
          className="fullscreen-action-button secondary"
          onClick={() => {}}
        >
          <div className="button-content">
            <span className="button-title">OUTWARD STORE LOGS</span>
            <span className="button-subtitle">
              Track and manage outgoing inventory
            </span>
          </div>
        </button>

        <button className="fullscreen-action-button" onClick={onOpenStockSheet}>
          <div className="button-content">
            <span className="button-title">STOCK SHEET</span>
            <span className="button-subtitle">
              Add stock items and view the master stock sheet
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default IMSContent;
