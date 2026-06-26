import { useState } from "react";
import { deleteIPO } from "../../services/integration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeleteIpoDialog = ({
  ipoToDelete,
  setIpoToDelete,
  setHoveredSubmenu,
  setHoveredMenu,
  selectedIpoForCNS,
  setSelectedIpoForCNS,
  selectedIpoForSpec,
  setSelectedIpoForSpec,
  selectedIpoForDerivedCNS,
  setSelectedIpoForDerivedCNS,
  onReloadSidebarData,
}) => {
  const [isDeletingIpo, setIsDeletingIpo] = useState(false);
  const [ipoDeleteError, setIpoDeleteError] = useState("");

  const cancelDeleteIpo = () => {
    if (isDeletingIpo) return;
    setIpoToDelete(null);
    setIpoDeleteError("");
  };

  const confirmDeleteIpo = async () => {
    if (!ipoToDelete) return;
    const targetId = ipoToDelete.ipoId || ipoToDelete.id;
    if (!targetId) {
      setIpoDeleteError("Cannot delete this IPO: missing identifier.");
      return;
    }
    setIsDeletingIpo(true);
    setIpoDeleteError("");
    try {
      await deleteIPO(targetId);
      const deletedCode = ipoToDelete.ipoCode || ipoToDelete.code || "";

      // Keep local completed cache in sync after delete.
      try {
        const raw = localStorage.getItem("completedIpos");
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deletedId = String(targetId);
          const deletedCodeStr = String(deletedCode);
          const next = parsed.filter((k) => {
            const s = String(k);
            return s !== deletedId && s !== deletedCodeStr;
          });
          if (next.length !== parsed.length) {
            localStorage.setItem("completedIpos", JSON.stringify(next));
          }
        }
      } catch (cleanupErr) {
        console.warn("Failed to clean completedIpos cache:", cleanupErr);
      }

      setIpoToDelete(null);
      setHoveredSubmenu(null);
      setHoveredMenu(null);

      if (
        selectedIpoForCNS &&
        (selectedIpoForCNS.ipoId === targetId ||
          selectedIpoForCNS.ipoCode === deletedCode)
      ) {
        setSelectedIpoForCNS(null);
      }
      if (
        selectedIpoForSpec &&
        (selectedIpoForSpec.ipoId === targetId ||
          selectedIpoForSpec.ipoCode === deletedCode)
      ) {
        setSelectedIpoForSpec(null);
      }
      if (
        selectedIpoForDerivedCNS &&
        (selectedIpoForDerivedCNS.ipoId === targetId ||
          selectedIpoForDerivedCNS.ipoCode === deletedCode)
      ) {
        setSelectedIpoForDerivedCNS(null);
      }

      await onReloadSidebarData?.();
      window.dispatchEvent(new Event("internalPurchaseOrdersUpdated"));
    } catch (error) {
      console.error("Failed to delete IPO:", error);
      setIpoDeleteError(
        error?.message ||
          error?.detail ||
          "Failed to delete IPO. Please try again.",
      );
    } finally {
      setIsDeletingIpo(false);
    }
  };

  return (
    <Dialog
      open={!!ipoToDelete}
      onOpenChange={(open) => {
        if (!open) cancelDeleteIpo();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        style={{ padding: "28px 32px", gap: "20px" }}
        showCloseButton={!isDeletingIpo}
      >
        <DialogHeader className="gap-3" style={{ paddingRight: "24px" }}>
          <DialogTitle>Delete IPO?</DialogTitle>
          <DialogDescription className="leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              {ipoToDelete?.ipoCode || ipoToDelete?.code || "this IPO"}
            </span>
            . This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {ipoDeleteError && (
          <div className="text-sm text-destructive">{ipoDeleteError}</div>
        )}
        <DialogFooter className="gap-3 sm:gap-3" style={{ paddingTop: "8px" }}>
          <Button
            type="button"
            variant="outline"
            onClick={cancelDeleteIpo}
            disabled={isDeletingIpo}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDeleteIpo}
            disabled={isDeletingIpo}
          >
            {isDeletingIpo ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteIpoDialog;
