import { LocalStore } from "@/lib/localStore";
import { ComplianceControlItem, ComplianceStatus } from "@/types";

export const complianceService = {
  async getControls(framework?: string): Promise<{ data: ComplianceControlItem[]; isFallback: boolean }> {
    let controls = LocalStore.getComplianceControls();
    if (framework && framework !== "ALL") {
      controls = controls.filter((c) => c.framework === framework);
    }
    return { data: controls, isFallback: true };
  },

  getComplianceStats() {
    const controls = LocalStore.getComplianceControls();
    const implemented = controls.filter((c) => c.status === "IMPLEMENTED").length;
    const partial = controls.filter((c) => c.status === "PARTIAL").length;
    const needsReview = controls.filter((c) => c.status === "NEEDS_REVIEW").length;
    const notImplemented = controls.filter((c) => c.status === "NOT_IMPLEMENTED").length;
    const score = Math.round(((implemented * 1 + partial * 0.5) / controls.length) * 100);

    return {
      score,
      total: controls.length,
      implemented,
      partial,
      needsReview,
      notImplemented,
    };
  },
};
