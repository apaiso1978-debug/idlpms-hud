/**
 * E-OS - Explorer Engine
 * Manages the hierarchical subject tree in the sidebar.
 * Encoding: UTF-8
 */

window.ExplorerEngine = {
    init() {
        console.log("Explorer Engine Initializing...");
        this.container = document.getElementById('explorer-tree');
        if (!this.container) return;
        this.renderCurriculum();
    },

    renderCurriculum() {
        console.log("[EXPLORER] Legacy Curriculum Tree disabled. Switching to Intelligence Hub Protocol...");
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="p-4 text-center opacity-30 mt-10">
                <i class="icon i-cpu h-8 w-8 mx-auto mb-2"></i>
                <div class="text-[10px] font-mono uppercase Thai-Rule">กำลังเปิดระบบเชื่อมต่ออัจฉริยะ...</div>
            </div>
        `;
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => window.ExplorerEngine.init());
