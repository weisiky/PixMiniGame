export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class Fighter {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  lastKey: string;
  attackBox: {
    position: Position;
    width: number;
    height: number;
  };
  color: string;
  isAttacking: boolean;
  isDefending: boolean;
  health: number;
  facing: 'left' | 'right';
  name: string;
  attackCooldown: number;
  jumpCount: number;

  constructor({ position, velocity, color, facing, name }: {
    position: Position;
    velocity: Velocity;
    color: string;
    facing: 'left' | 'right';
    name: string;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 50;
    this.height = 120;
    this.lastKey = '';
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      width: 90,
      height: 30
    };
    this.color = color;
    this.isAttacking = false;
    this.isDefending = false;
    this.health = 100;
    this.facing = facing;
    this.name = name;
    this.attackCooldown = 0;
    this.jumpCount = 0;
  }

  draw(c: CanvasRenderingContext2D) {
    // Defending Shield (Behind/Around body)
    if (this.isDefending) {
      c.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, 75, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = 'rgba(0, 255, 255, 0.15)';
      c.fill();
    }

    // Mecha Body (Rectangular placeholder)
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Shoulders
    c.fillStyle = '#475569';
    c.fillRect(this.position.x - 5, this.position.y + 10, this.width + 10, 20);

    // Visor
    c.fillStyle = '#0ff'; // Cyan neon eye
    const visorWidth = 20;
    const visorHeight = 8;
    const visorY = this.position.y + 15;
    if (this.facing === 'right') {
      c.fillRect(this.position.x + this.width - visorWidth + 5, visorY, visorWidth, visorHeight);
    } else {
      c.fillRect(this.position.x - 5, visorY, visorWidth, visorHeight);
    }

    // Attack Box (Laser sword effect)
    if (this.isAttacking) {
      c.fillStyle = 'rgba(255, 255, 0, 0.9)'; // bright yellow
      c.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
      // Sword core
      c.fillStyle = 'white';
      c.fillRect(
        this.attackBox.position.x + (this.facing === 'right' ? 0 : 20),
        this.attackBox.position.y + 10,
        this.attackBox.width - 20,
        10
      );
    }
  }

  update(c: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.draw(c);

    if (this.attackCooldown > 0) this.attackCooldown--;

    // Update Attack Box position
    if (this.facing === 'right') {
      this.attackBox.position.x = this.position.x + this.width;
    } else {
      this.attackBox.position.x = this.position.x - this.attackBox.width;
    }
    this.attackBox.position.y = this.position.y + 40; // Mid height

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Horizontal Bounds
    if (this.position.x <= 0) this.position.x = 0;
    if (this.position.x + this.width >= canvasWidth) this.position.x = canvasWidth - this.width;

    // Gravity
    const groundLevel = canvasHeight - 80;
    if (this.position.y + this.height + this.velocity.y >= groundLevel) {
      this.velocity.y = 0;
      this.position.y = groundLevel - this.height;
      this.jumpCount = 0;
    } else {
      this.velocity.y += 0.8; // Gravity pull
    }
  }

  attack() {
    if (this.isDefending || this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackCooldown = 30; // frames
    setTimeout(() => {
      this.isAttacking = false;
    }, 100); // duration of attack frame
  }

  takeHit(damage: number) {
    if (this.isDefending) {
      this.health -= damage * 0.2; // 80% reduction
    } else {
      this.health -= damage;
    }
    if (this.health < 0) this.health = 0;
  }
}
