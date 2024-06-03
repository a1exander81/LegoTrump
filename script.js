class Particle {
    constructor(effect) {
        this.effect = effect;
        this.radius = Math.floor(Math.random() * 10 + 1);
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        this.vx = Math.random() * 1 - 0.5;
        this.vy = Math.random() * 1 - 0.5;
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.7;
        this.image = document.getElementById('trumplego');
        this.spriteWidth = 50;
        this.spriteHeight = 50;
        this.sizeModifier = Math.random() + 0.2;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.halfWidth = this.width * 0.5;
        this.halfHeight = this.height * 0.5;
        this.frameX = Math.floor(Math.random() * 3);
        this.frameY = Math.floor(Math.random() * 3);
    }
    draw(context) {
        context.drawImage(this.image, this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight, this.spriteWidth,
            this.spriteHeight, this.x - this.halfWidth, this.y - 
            this.halfHeight, this.width, this.height);
    }
    update() {
        if (this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const force = (this.effect.mouse.radius / distance);
            if (distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx);
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
            }
        }

        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;

        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x > this.effect.width - this.radius) {
            this.x = this.effect.width - this.radius;
            this.vx *= -1;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y > this.effect.height - this.radius) {
            this.y = this.effect.height - this.radius;
            this.vy *= -1;
        }
    }
    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

class Effect {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 500;
        this.createParticles();

        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 100
        }

        window.addEventListener('resize', e => this.resize(e.target.innerWidth, e.target.innerHeight));
        window.addEventListener('mousemove', e => {
            if (this.mouse.pressed) {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            }
        });
        window.addEventListener('mousedown', e => {
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseup', e => this.mouse.pressed = false);
    }
    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }
    handleParticles(context) {
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
    connectParticles(context) {
        const maxDistance = 80;
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);
                if (distance < maxDistance) {
                    context.save();
                    const opacity = 1 - (distance / maxDistance);
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.context.strokeStyle = 'white';
        this.particles.forEach(particle => particle.reset());
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.strokeStyle = 'white';

    const effect = new Effect(canvas, ctx);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.handleParticles(ctx);
        requestAnimationFrame(animate);
    }
    animate();

    const items = document.querySelectorAll(".item");
    const menu = document.querySelector(".menu");

    const increment = 360 / items.length;
    let angle = 0;
    let accumulatedDeltaY = 0;

    items.forEach((item, index) => {
        const iterator = angle + increment * index;
        item.style.transform = `rotateX(${iterator}deg) translateZ(120px)`;

        const opacity = findOpacity(iterator % 360);
        item.style.opacity = opacity;

        item.classList.toggle('active', opacity === 1);
    });

    function findOpacity(angle) {
        const newAngle = angle % 90;
        const opacity = 1 - (newAngle / 90);
        return opacity;
    }

    function handleScroll() {
        if (Math.abs(accumulatedDeltaY) >= 80) {
            const rotation = Math.sign(accumulatedDeltaY) * increment;
            angle += rotation;
            accumulatedDeltaY = 0;

            items.forEach((item, index) => {
                const iterator = angle + increment * index;
                item.style.transform = `rotateX(${iterator}deg) translateZ(120px)`;

                const opacity = findOpacity(iterator % 360);
                item.style.opacity = opacity;

                item.classList.toggle('active', opacity === 1);
            });
        }
    }

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    menu.addEventListener("wheel", e => {
        accumulatedDeltaY += e.deltaY;
        debounce(handleScroll, 100)();
    });
    // Get the donate link element
const donateLink = document.getElementById('donate-link');

// Get the glass container element
const glassContainer = document.getElementById('glass-container');

// Define the text to show on Donate click
const donateText = `
    <h3>
        Your donation will be of great help to promote Trump's campaign and for the marketing our $LEGO project.
        <br>
        <span id="donate-address">E6cGhpdd92ucjGQhYCogG1T4TfjRdKx2m6ABoXpYGZX9</span>
    </h3>
`;

// Add event listener to update glass container on Donate link click
donateLink.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    glassContainer.innerHTML = donateText; // Update glass container content
    addHoverPrompt(); // Add hover prompt for the address
});

// Function to add hover prompt
function addHoverPrompt() {
    const donateAddress = document.getElementById('donate-address');
    donateAddress.style.cursor = 'pointer';
    donateAddress.title = 'Click to copy address';

    // Add event listener for hover effect
    donateAddress.addEventListener('mouseover', function() {
        donateAddress.title = 'Click to copy address';
    });

    // Add event listener for click to copy
    donateAddress.addEventListener('click', function() {
        copyToClipboard(donateAddress.innerText);
    });
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('Address copied to clipboard: ' + text);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
}
// Function to update the glass container text
function updateGlassContainer(content) {
    const glassContainer = document.getElementById('glass-container');
    glassContainer.innerHTML = content;
}

// Function to handle clicking on "Donate" link
document.getElementById('donate-link').addEventListener('click', function(e) {
    e.preventDefault();
    const donateText = `
        <h3>
            <p>
                Your donation will mean a lot to the future of USA and the rest of the world. 
                Send your donation here: <br>
                <strong>E6cGhpdd92ucjGQhYCogG1T4TfjRdKx2m6ABoXpYGZX9</strong>
            </p>
        </h3>`;
    updateGlassContainer(donateText);
});

// Function to handle clicking on "RoadMap" link
document.querySelectorAll('.item').forEach(item => {
    if (item.textContent.trim() === 'RoadMap') {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const roadmapText = `
                <h3>
                    <p>
                        Our Roadmap:
                        <ul>
                            <li>Phase 1: Community take-over with organic marketing through CT engagements.
                            Dex updates and Community Airdrops </li>
                            <li>Phase 2: Paid Marketing, KOL's onboarding, paid trending, Campaign donations to President Trump </li>
                            <li>Phase 3: NFT Collections,DAPP development for self-marketing.</li>
                        </ul>
                    </p>
                </h3>`;
            updateGlassContainer(roadmapText);
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const iconContainer = document.querySelector(".icon-container");

    iconContainer.addEventListener("mouseover", function(event) {
        if (event.target.classList.contains("icon")) {
            event.target.style.transform = "scale(1.5)";
            showTooltip(event.target, "Click to visit!");
        }
    });

    iconContainer.addEventListener("mouseout", function(event) {
        if (event.target.classList.contains("icon")) {
            event.target.style.transform = "scale(1)";
            hideTooltip(event.target);
        }
    });

    function showTooltip(element, message) {
        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerHTML = message;
        element.parentElement.appendChild(tooltip);
    }

    function hideTooltip(element) {
        let tooltip = element.parentElement.querySelector(".tooltip");
        if (tooltip) {
            tooltip.remove();
        }
    }
});

});
