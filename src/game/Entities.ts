export interface Point {
  x: number;
  y: number;
}

export class BlackHole {
  x: number;
  y: number;
  radius: number;
  power: number;
  lifeTime: number; // in ms
  maxLifeTime: number;
  active: boolean = true;
  angle: number = 0;

  constructor(x: number, y: number, level: number) {
    this.x = x;
    this.y = y;
    // Base stats + scale by level
    this.radius = 100 + (level * 20); // How far it pulls
    this.power = 0.5 + (level * 0.1); // Pull strength
    this.maxLifeTime = 3000 + (level * 500); // Duration
    this.lifeTime = this.maxLifeTime;
  }

  update(deltaTime: number) {
    this.lifeTime -= deltaTime;
    if (this.lifeTime <= 0) {
      this.active = false;
    }
    this.angle += deltaTime * 0.005; // Spin visual
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Event Horizon (Black center)
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.shadowColor = '#6b21a8'; // Purple rim
    ctx.shadowBlur = 20;
    ctx.fill();

    // Accretion Disk (Swirling purple/blue)
    const fadeOut = Math.min(1, this.lifeTime / 500); // simple fade at end
    const fadeIn = Math.min(1, (this.maxLifeTime - this.lifeTime) / 500); // fade in at start
    ctx.globalAlpha = fadeOut * fadeIn;
    
    // Draw rings
    for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * (0.3 + i*0.2), this.radius * (0.2 + i*0.1), i * Math.PI/3, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 2 + (Math.sin(this.angle * 5 + i) * 2);
        ctx.stroke();
    }
    
    // Pull Area visual indicator (faint)
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88, 28, 135, 0.05)';
    ctx.fill();

    ctx.restore();
  }
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  
  constructor(x: number, y: number, vx: number, vy: number, radius: number, color: string, decay: number = 0.02) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.alpha = 1;
    this.decay = decay;
  }

  update(timeScale: number) {
    this.x += this.vx * timeScale;
    this.y += this.vy * timeScale;
    this.alpha -= this.decay * timeScale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    // Core
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fill();
    // Glow
    ctx.globalAlpha = this.alpha * 0.4;
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

export class Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;

  speedMult: number;

  constructor(x: number, y: number, size: number, speed: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.alpha = Math.random() * 0.8 + 0.2;
    this.speedMult = 1;
  }

  update(height: number, timeScale: number, globalSpeedMult: number = 1) {
    this.y += this.speed * timeScale * globalSpeedMult;
    if (this.y > height) {
      this.y = 0;
      this.x = Math.random() * (window.innerWidth || 800); // approximate reset
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isEnemy: boolean;
  active: boolean = true;

  constructor(x: number, y: number, vx: number, vy: number, color: string, isEnemy: boolean, radius: number = 4) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.isEnemy = isEnemy;
    this.radius = radius;
  }

  update(timeScale: number) {
    this.x += this.vx * timeScale;
    this.y += this.vy * timeScale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    // Core
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Glow
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

export class Player {
  x: number;
  y: number;
  width: number = 40;
  height: number = 50;
  hp: number = 100;
  maxHp: number = 100;
  color: string = '#00ffff';
  weaponLevel: number = 1;
  hasShield: boolean = false;
  active: boolean = true;
  lastShotTime: number = 0;
  
  // Base stats that scale with level
  baseFireRate: number = 160; 
  fireRate: number = 160; // ms between shots
  bulletSpeed: number = 15;
  agility: number = 0.6; // Lerp factor (responsiveness)
  
  // Visual effects
  hitFlashTime: number = 0;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Psychological & Logical Upgrade System
  levelUp(newLevel: number) {
    // 1. Durability: Max HP increases slightly (+5 per level)
    const oldMax = this.maxHp;
    this.maxHp = 100 + (newLevel - 1) * 5;
    this.hp += (this.maxHp - oldMax); // Heal the difference
    
    // 2. Weapon Systems: Fire rate gets slightly faster (caps at 90ms for stability)
    this.fireRate = Math.max(90, this.baseFireRate - (newLevel - 1) * 5);
    
    // 3. Propulsion: Bullets get slightly faster (+0.4 per level, cap at 22)
    this.bulletSpeed = Math.min(22, 15 + (newLevel - 1) * 0.4);
    
    // 4. Agility: Ship becomes micro-fractionally more responsive to touch
    this.agility = Math.min(0.85, 0.6 + (newLevel - 1) * 0.015);
  }

  update(deltaTime: number) {
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    
    // Draw shield
    if (this.hasShield) {
      ctx.beginPath();
      // Increase shield radius to visually encase the wider detailed model
      ctx.arc(this.x, this.y, this.width * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = '#22d3ee';
      
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;
      ctx.stroke();
    }

    // Hover animation y-offset
    const hoverY = Math.sin(this.hoverTime) * 3;
    ctx.translate(this.x, this.y + hoverY);

    // Apply tilt/banking based on horizontal velocity
    // Limit tilt to max 25 degrees
    const maxTilt = 25 * (Math.PI / 180);
    const tilt = Math.max(-maxTilt, Math.min(maxTilt, this.vx * 0.15));
    ctx.rotate(tilt);

    const hit = this.hitFlashTime > 0;
    const s = 1.35; // Vector scale up for cinematic detail
    const hw = (this.width / 2) * s;
    const hh = (this.height / 2) * s;

    // Thruster sizes based on forward/backward velocity
    const thrustScale = Math.max(0.6, Math.min(1.5, 1 - this.vy * 0.5));
    
    if (!hit) {
      // THRUST FLAMES (Underneath ship)
      const drawThrust = (tx: number, ty: number, tw: number, th: number) => {
        const flicker = 0.8 + Math.random() * 0.4;
        const h = th * thrustScale * flicker;
        
        ctx.beginPath();
        ctx.moveTo(tx - tw/2, ty);
        ctx.lineTo(tx + tw/2, ty);
        ctx.lineTo(tx, ty + h);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)'; // Cyan Glow
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(tx - tw/3, ty);
        ctx.lineTo(tx + tw/3, ty);
        ctx.lineTo(tx, ty + h * 0.7);
        ctx.closePath();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'; // Purple Core
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(tx - tw/6, ty);
        ctx.lineTo(tx + tw/6, ty);
        ctx.lineTo(tx, ty + h * 0.4);
        ctx.closePath();
        ctx.fillStyle = 'white'; // White super-hot center
        ctx.fill();
      };
      
      const engineY = hh * 0.8;
      
      // Main Engines
      drawThrust(-16, engineY, 14, 40);
      drawThrust(16, engineY, 14, 40);
      
      // Outer small engines
      drawThrust(-32, engineY - 5, 8, 20);
      drawThrust(32, engineY - 5, 8, 20);
    }

    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
      if (hit) {
        // Red flashing effect for damage
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)';
        ctx.drawImage(this.image, -hw * 1.5, -hh * 1.2, hw * 3, hh * 2.4);
        ctx.filter = 'none';
      } else {
        ctx.shadowColor = 'rgba(34, 211, 238, 0.3)';
        ctx.shadowBlur = 15;
        // Standard draw
        ctx.drawImage(this.image, -hw * 1.5, -hh * 1.2, hw * 3, hh * 2.4);
        ctx.shadowBlur = 0;
      }
    } else {
      // Fallback shape if image not yet loaded or missing
      ctx.fillStyle = hit ? '#ef4444' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.stroke();
    }

    ctx.restore();
  }
}

export class Enemy {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  active: boolean = true;
  type: number;
  vx: number;
  vy: number;
  lastShotTime: number = 0;
  fireRate: number;
  hitFlashTime: number = 0;
  angle: number = 0;

  constructor(x: number, y: number, type: number, level: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    if (type === 0) {
      // Scout: Fast, sleek, no weapons
      this.radius = 20;
      this.hp = 15 + level * 5;
      this.color = '#ec4899'; // pink
      this.vy = 3 + Math.random() * 2;
      this.vx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random());
      this.fireRate = 0;
    } else if (type === 1) {
      // Fighter: Medium, shoots
      this.radius = 25;
      this.hp = 40 + level * 10;
      this.color = '#eab308'; // yellow
      this.vy = 1.5 + Math.random();
      this.vx = (Math.random() - 0.5) * 3;
      this.fireRate = Math.max(800, 1800 - level * 50); // scales with level
    } else if (type === 2) {
      // Tank/Bomber: Slow, tough, heavy weapons
      this.radius = 35;
      this.hp = 120 + level * 25;
      this.color = '#a855f7'; // purple
      this.vy = 0.8 + Math.random() * 0.4;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.fireRate = Math.max(1000, 2200 - level * 60);
    } else {
      // Boss: Giant, very tough, bullet hell
      this.radius = 60;
      this.hp = 600 + level * 150;
      this.color = '#ef4444'; // red 
      this.vy = 0.5;
      this.vx = 1.5;
      this.fireRate = Math.max(400, 800 - level * 20); // Fast shooting boss
    }
    this.maxHp = this.hp;
  }

  update(deltaTime: number, width: number, timeScale: number) {
    this.x += this.vx * timeScale;
    this.y += this.vy * timeScale;
    
    if (this.type === 3) {
      // Boss sweep
      if (this.y > 150) this.vy = 0; // stop at top
    }

    // Bounce off walls
    if (this.x - this.radius < 0) {
       this.x = this.radius;
       this.vx *= -1;
    } else if (this.x + this.radius > width) {
       this.x = width - this.radius;
       this.vx *= -1;
    }
    
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.hitFlashTime > 0) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.strokeStyle = this.color;
    }
    
    ctx.beginPath();
    if (this.type === 0) {
      // Scout: sleek dart facing down
      ctx.moveTo(0, this.radius); 
      ctx.lineTo(this.radius/1.5, -this.radius); 
      ctx.lineTo(0, -this.radius/2); 
      ctx.lineTo(-this.radius/1.5, -this.radius); 
    } else if (this.type === 1) {
      // Fighter: twin blaster ship
      ctx.moveTo(0, this.radius * 0.8); 
      ctx.lineTo(this.radius * 0.3, 0); 
      ctx.lineTo(this.radius, -this.radius * 0.5); 
      ctx.lineTo(this.radius * 0.6, -this.radius * 0.8); 
      ctx.lineTo(0, -this.radius * 0.4); 
      ctx.lineTo(-this.radius * 0.6, -this.radius * 0.8);
      ctx.lineTo(-this.radius, -this.radius * 0.5); 
      ctx.lineTo(-this.radius * 0.3, 0); 
    } else if (this.type === 2) {
      // Tank: Bulky shield ship
      ctx.moveTo(0, this.radius); 
      ctx.lineTo(this.radius * 0.8, this.radius * 0.4); 
      ctx.lineTo(this.radius, -this.radius * 0.6); 
      ctx.lineTo(this.radius * 0.4, -this.radius); 
      ctx.lineTo(-this.radius * 0.4, -this.radius); 
      ctx.lineTo(-this.radius, -this.radius * 0.6); 
      ctx.lineTo(-this.radius * 0.8, this.radius * 0.4);
    } else {
      // Boss: Dreadnought
      ctx.moveTo(0, this.radius);
      ctx.lineTo(this.radius * 0.2, this.radius * 0.4);
      ctx.lineTo(this.radius * 0.9, this.radius * 0.2);
      ctx.lineTo(this.radius * 0.6, -this.radius * 0.8);
      ctx.lineTo(this.radius * 0.2, -this.radius * 0.5);
      ctx.lineTo(0, -this.radius);
      ctx.lineTo(-this.radius * 0.2, -this.radius * 0.5);
      ctx.lineTo(-this.radius * 0.6, -this.radius * 0.8);
      ctx.lineTo(-this.radius * 0.9, this.radius * 0.2);
      ctx.lineTo(-this.radius * 0.2, this.radius * 0.4);
    }
    ctx.closePath();
    
    if (this.hitFlashTime > 0) {
      ctx.fill();
    } else {
      // Glow Line
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Core Line
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Draw HP bar
    ctx.translate(-this.x, -this.y); // un-translate completely before normal drawing
    
    // HP Bar
    const hpPct = this.hp / this.maxHp;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x - 20, this.y - this.radius - 15, 40, 4);
    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 0;
    ctx.fillRect(this.x - 20, this.y - this.radius - 15, 40 * hpPct, 4);
    ctx.restore();
  }
}

export type PowerUpType = 'shield' | 'weapon' | 'heal';

export class PowerUp {
  x: number;
  y: number;
  radius: number = 15;
  type: PowerUpType;
  vy: number = 2;
  active: boolean = true;
  angle: number = 0;
  color: string;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    switch(type) {
      case 'shield': this.color = '#3b82f6'; break;
      case 'weapon': this.color = '#f59e0b'; break;
      case 'heal': this.color = '#10b981'; break;
    }
  }

  update(timeScale: number) {
    this.y += this.vy * timeScale;
    this.angle += 0.05 * timeScale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    ctx.strokeStyle = this.color;
    
    // Draw diamond
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius, 0);
    ctx.closePath();
    
    // Glow
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Core
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = this.color;
    // Inner icon indicator
    ctx.globalAlpha = 0.5;
    ctx.fill();
    
    ctx.restore();
  }
}
