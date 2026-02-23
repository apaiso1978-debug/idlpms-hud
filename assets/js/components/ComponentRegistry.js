/**
 * ComponentRegistry - Unified OS Component Loader
 * ═══════════════════════════════════════════════════════
 * Allows the system to dynamically mount small functional
 * widgets (DNA Radar, Fitness Forms) anywhere across the HUD.
 */
class ComponentRegistry {
    constructor() {
        this.registeredComponents = new Map();
        this.activeInstances = new Map();
        // Use root-relative absolute path so it resolves anywhere (hud.html or pages/xyz.html)
        this.basePath = '/assets/js/components/';
    }

    /**
     * Registers a component definition into the registry.
     * @param {string} componentName 
     * @param {class|function} constructorFn - The ES6 class to instantiate
     */
    register(componentName, constructorFn) {
        if (this.registeredComponents.has(componentName)) {
            console.warn(`[ComponentRegistry] ${componentName} is already registered.`);
            return;
        }
        this.registeredComponents.set(componentName, constructorFn);
        console.log(`[ComponentRegistry] Registered: ${componentName}`);
    }

    /**
     * Finds elements with data-component="ComponentName" and mounts them.
     */
    mountAll() {
        const mountPoints = document.querySelectorAll('[data-component]');
        mountPoints.forEach(element => {
            const componentName = element.getAttribute('data-component');
            const propsString = element.getAttribute('data-props');
            let props = {};

            try {
                if (propsString) props = JSON.parse(propsString);
            } catch (e) {
                console.warn(`[ComponentRegistry] Failed to parse props for ${componentName}`, e);
            }

            this.mount(element, componentName, props);
        });
    }

    /**
     * Mounts a specific component onto a DOM element.
     */
    async mount(element, componentName, props = {}) {
        if (!element) return null;

        // If not loaded yet, attempt to lazy load the script
        if (!this.registeredComponents.has(componentName)) {
            const loaded = await this._lazyLoadScript(componentName);
            if (!loaded) {
                element.innerHTML = `<div class="text-[var(--vs-danger)] text-[13px] border border-[var(--vs-danger)] p-4 rounded-[3px] bg-red-900/10">Failed to load component: ${componentName}</div>`;
                return null;
            }
        }

        const Constructor = this.registeredComponents.get(componentName);
        if (!Constructor) return null;

        try {
            // Instantiate the component
            const instance = new Constructor(element, props);

            // Store reference
            const instanceId = `${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            element.setAttribute('data-instance-id', instanceId);
            this.activeInstances.set(instanceId, instance);

            // Trigger render if available
            if (typeof instance.render === 'function') {
                await instance.render();
            }

            return instance;
        } catch (error) {
            console.error(`[ComponentRegistry] Error mounting ${componentName}:`, error);
            element.innerHTML = `<div class="text-[var(--vs-danger)] text-[13px]">Component Error</div>`;
            return null;
        }
    }

    /**
     * Destroys a component instance and cleans up memory.
     */
    unmount(element) {
        const instanceId = element.getAttribute('data-instance-id');
        if (instanceId && this.activeInstances.has(instanceId)) {
            const instance = this.activeInstances.get(instanceId);
            if (typeof instance.destroy === 'function') {
                instance.destroy();
            }
            this.activeInstances.delete(instanceId);
            element.removeAttribute('data-instance-id');
            element.innerHTML = ''; // Clear DOM
        }
    }

    /**
     * Dynamically loads a JS class script if missing.
     */
    _lazyLoadScript(componentName) {
        return new Promise((resolve) => {
            // Convert PascalCase to snake_case if needed, or assume file is exact name
            let fileName = componentName;
            // Optional: convert DNA_RadarWidget -> dna_radar_widget.js if that's standard
            // For now, we assume standard: DNA_RadarWidget.js inside assets/js/components/

            const scriptPath = `${this.basePath}${fileName}.js`;

            // Check if already in DOM
            if (document.querySelector(`script[src*="${fileName}.js"]`)) {
                // It's in DOM but maybe not registered yet (loading async). Wait briefly.
                setTimeout(() => resolve(this.registeredComponents.has(componentName)), 500);
                return;
            }

            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                // The script itself should call window.ComponentRegistry.register()
                resolve(true);
            };
            script.onerror = () => {
                console.error(`[ComponentRegistry] Missing component file: ${scriptPath}`);
                resolve(false);
            };

            document.head.appendChild(script);
        });
    }
}

// Global Singleton
if (!window.ComponentRegistry) {
    window.ComponentRegistry = new ComponentRegistry();

    // Auto-mount on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        window.ComponentRegistry.mountAll();
    });
}
