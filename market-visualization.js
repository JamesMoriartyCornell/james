import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { gsap } from 'gsap';

class MarketVisualization {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.points = [];
        this.lines = [];
        this.controls = null;
        this.animationFrame = null;
        this.data = [];
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Start animation loop
        this.animate();

        // Fetch initial data
        this.fetchData();

        // Setup resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async fetchData() {
        try {
            // Fetch SPY intraday data from Yahoo Finance
            const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/SPY', {
                params: {
                    interval: '5m',
                    range: '1d'
                }
            });

            console.log('Yahoo Finance API response:', response.data);

            const result = response.data.chart.result[0];
            const timestamps = result.timestamp;
            const prices = result.indicators.quote[0].close;

            this.data = timestamps.map((ts, i) => ({
                time: new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: prices[i]
            })).filter(point => point.price !== null);

            console.log('Processed data for visualization:', this.data);

            this.updateVisualization();
            this.updateStats();

            // Update every 5 minutes
            setTimeout(() => this.fetchData(), 5 * 60 * 1000);
        } catch (error) {
            console.error('Error fetching market data:', error);
        }
    }

    updateVisualization() {
        // Clear existing points and lines
        this.points.forEach(point => this.scene.remove(point));
        this.lines.forEach(line => this.scene.remove(line));
        this.points = [];
        this.lines = [];

        if (!this.data || this.data.length === 0) {
            console.warn('No data available for visualization.');
            return;
        }

        // Create new visualization
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0x4299E1,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        const positions = [];
        const colors = [];

        this.data.forEach((point, index) => {
            const x = (index / this.data.length) * 4 - 2;
            const y = (point.price - Math.min(...this.data.map(d => d.price))) / 
                     (Math.max(...this.data.map(d => d.price)) - Math.min(...this.data.map(d => d.price))) * 2 - 1;
            const z = Math.sin(index * 0.1) * 0.5;

            positions.push(x, y, z);
            colors.push(0.26, 0.6, 0.89); // Blue color
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.points.push(points);

        // Create line connecting points
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4299E1,
            transparent: true,
            opacity: 0.5
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(line);
        this.lines.push(line);

        // Animate the visualization
        gsap.to(points.rotation, {
            y: Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });
    }

    updateStats() {
        const currentPrice = this.data[this.data.length - 1].price;
        const previousPrice = this.data[0].price;
        const priceChange = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);

        document.getElementById('current-price').textContent = `$${currentPrice.toFixed(2)}`;
        document.getElementById('price-change').textContent = `${priceChange}%`;
        document.getElementById('price-change').style.color = priceChange >= 0 ? '#48bb78' : '#f56565';
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.controls.dispose();
        this.renderer.dispose();
    }
}

export default MarketVisualization; 