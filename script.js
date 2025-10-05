const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// Thiết lập kích thước canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Màu sắc và cấu hình
const HEART_COLOR = 'rgb(255, 105, 180)'; 
const PARTICLE_COUNT = 300; 
const HEART_SIZE_BASE = 12; // Kích thước cơ bản

// --- Lớp Hạt (Particle) ---
class Particle {
    constructor(x, y, color, speed, angle, isReflected = false) {
        this.x = x;
        this.y = y;
        this.radius = 1.5;
        this.color = color;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.friction = 0.99; 
        // Trọng lực: âm cho phản chiếu (bay lên), dương cho pháo hoa (rơi xuống)
        this.gravity = isReflected ? -0.05 : 0.05; 
        this.alpha = 1; 
        this.decay = 0.005; // Giảm tốc độ mờ chậm hơn
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Mờ dần nhanh hơn cho phản chiếu
        this.alpha -= this.decay; 
    }
}

let particles = [];
let frameCount = 0;

// --- Hàm Tạo Hình Trái Tim (Bao gồm phản chiếu) ---
function createHeartParticles(centerX, centerY, size) {
    const angleStep = (2 * Math.PI) / PARTICLE_COUNT;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = i * angleStep;
        
        // Công thức hình trái tim
        let xHeart = size * (16 * Math.pow(Math.sin(t), 3));
        let yHeart = -size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); 
        
        // Vị trí cuối cùng trên canvas
        let finalX = centerX + xHeart;
        let finalY = centerY + yHeart;
        
        // Tốc độ và hướng nổ
        const speed = Math.random() * 4 + 2;
        const angle = Math.atan2(finalY - centerY, finalX - centerX) + (Math.random() - 0.5) * 0.8; 
        
        // 1. Tạo Particle Gốc (Pháo hoa chính)
        particles.push(new Particle(centerX, centerY, HEART_COLOR, speed, angle, false));

        // 2. Tạo Particle Phản Chiếu
        // Vị trí phản chiếu: y của điểm nổ ban đầu (center Y) là trục đối xứng
        // Phản chiếu sẽ được đẩy lên (gravity âm)
        particles.push(new Particle(
            centerX, 
            centerY, 
            HEART_COLOR,
speed * 0.5, // Tốc độ phản chiếu chậm hơn
            -angle,      // Đảo ngược góc 
            true         // Đánh dấu là phản chiếu
        ));
    }
}

// --- Vòng Lặp Hoạt Hình (Animation Loop) ---
function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    // Xóa màn hình với một lớp mờ để tạo hiệu ứng "vệt"
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cập nhật và vẽ các hạt
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.alpha <= 0.01) {
            particles.splice(i, 1);
        }
    }
}

// --- Logic Trái Tim Đập và Tạo Pháo Hoa Lặp Lại ---
const centerX = canvas.width / 2;
const centerY = canvas.height / 2 - 100; // Dịch lên trên để chừa chỗ cho phản chiếu

function pulseAndExplode() {
    // Tính toán độ lớn "đập" sử dụng hàm sin
    // Hàm sin sẽ cho giá trị từ -1 đến 1. Chúng ta đưa nó về 0.8 đến 1.2
    const scale = 1 + Math.sin(frameCount * 0.05) * 0.2; // Biên độ 0.2
    const currentSize = HEART_SIZE_BASE * scale;

    // Xóa các hạt cũ trước khi tạo vụ nổ mới
    particles = []; 
    
    // Tạo vụ nổ mới với kích thước hiện tại (tạo cảm giác "đập")
    createHeartParticles(centerX, centerY, currentSize);
}

// Khởi tạo vụ nổ và đặt hẹn giờ để lặp lại (ví dụ: mỗi 1.5 giây)
setInterval(pulseAndExplode, 1500); 

// Bắt đầu vòng lặp hiển thị
animate();

// LƯU Ý: Phải gọi lại pulseAndExplode 1 lần ban đầu để có hình
pulseAndExplode();
