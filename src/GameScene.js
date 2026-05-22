class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isSmiling = true;
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.spawnTimer = null;
    }

    preload() {
        this.load.image('purple_body', 'assets/purple_body_circle.png');
        this.load.image('pink_body', 'assets/pink_body_circle.png');
        this.load.image('face_smile', 'assets/face_smile_open_eye.png');
        this.load.image('face_frown', 'assets/face_frown_open_eye.png');
    }

    create() {
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;

        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#333333',
            fontStyle: 'bold'
        });

        this.comboText = this.add.text(16, 48, 'Combo: 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#666666'
        });

        this.bestComboText = this.add.text(16, 72, 'Best Combo: 0', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#999999'
        });

        this.hintText = this.add.text(400, 570, 'Click the frowning faces to cheer them up!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0.5);

        //const cx = 400;
        //const cy = 300;

        //this.body = this.add.image(cx, cy, 'purple_body');
        //this.body.setInteractive();

        //this.face = this.add.image(cx, cy, 'face_smile');
        //this.face.setInteractive();

        //this.body.on('pointerdown', () => this.toggleFace());
        //this.face.on('pointerdown', () => this.toggleFace());

        this.characters = this.add.group();

        this.spawnTimer = this.time.addEvent({
            delay: 1200,
            callback: this.spawnCharacter,
            callbackScope: this,
            loop: true
        });

        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 400, () => this.spawnCharacter(), [], this);
        }
    }

    spawnCharacter() {
        const padding = 80;
        const x = Phaser.Math.Between(padding, 800 - padding);
        const y = Phaser.Math.Between(padding, 600 - padding);

        const container = this.add.container(x, y);
        container.setAlpha(0);
        container.setScale(0.3);

        const body = this.add.image(0, 0, 'purple_body');

        const face = this.add.image(0, 0, 'face_frown');

        container.add([body, face]);

        container.setSize(body.width, body.height);
        container.setInteractive();

        container.setData('clicked', false);
        container.setData('face', face);
        container.setData('body', body);

        this.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        const driftX = Phaser.Math.Between(-30, 30);
        const driftY = Phaser.Math.Between(-30, 30);
        const driftDuration = Phaser.Math.Between(2000, 4000);

        this.tweens.add({
            targets: container,
            x: x + driftX,
            y: y + driftY,
            duration: driftDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: container,
            angle: Phaser.Math.Between(-8, 8),
            duration: Phaser.Math.Between(1000, 2000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        container.on('pointerdown', () => {
            if (container.getData('clicked')) return;
            this.onCharacterClick(container);
        });

        this.characters.add(container);

        this.time.delayedCall(8000, () => {
            if (container.active && !container.getData('clicked')) {
                this.tweens.add({
                    targets: container,
                    alpha: 0,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    duration: 800,
                    ease: 'Power2.easeIn',
                    onComplete: () => {
                        container.destroy();
                    }
                });
            }
        });
    }

    onCharacterClick(container) {
        container.setData('clicked', true);
        this.combo++;
        if (this.combo > this.bestCombo) {
            this.bestCombo = this.combo;
            this.bestComboText.setText('Best Combo: ' + this.bestCombo);
        }

        const points = this.combo;
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        this.comboText.setText('Combo: ' + this.combo);

        if (this.combo >= 5) {
            this.comboText.setColor('#e74c3c');
        } else if (this.combo >= 3) {
            this.comboText.setColor('#e67e22');
        } else {
            this.comboText.setColor('#666666');
        }

        const body = container.getData('body');
        const face = container.getData('face');

        body.setTexture('pink_body');
        face.setTexture('face_smile');

        this.tweens.add({
            targets: container,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        const popText = this.add.text(container.x, container.y - 50, '+' + points, {
            fontSize: points >= 5 ? '32px' : points >= 3 ? '26px' : '20px',
            fontFamily: 'Arial',
            color: points >= 5 ? '#e74c3c' : points >= 3 ? '#e67e22' : '#27ae60',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: popText,
            y: popText.y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => popText.destroy()
        });

        this.time.delayedCall(1000, () => {
            if (container.active) {
                this.tweens.add({
                    targets: container,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 600,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        container.destroy();
                    }
                });
            }
        });

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.combo > 0) this.combo = 0;
                this.comboText.setText('Combo: 0');
                this.comboText.setColor('#666666');
            }
        });
    }

    toggleFace() {
        this.isSmiling = !this.isSmiling;
        this.face.setTexture(this.isSmiling ? 'face_smile' : 'face_frown');
    }
}
