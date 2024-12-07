class WhackAFriend {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.friends = document.querySelectorAll('.friend');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.startButton = document.getElementById('startGame');
        
        // 朋友头像数组（替换为实际的图片URL）
        this.friendImages = [
            'images/孙.jpg',
            'images/王.png',
            'images/吕.png',
            'images/林.png'
        ];
        
        this.highScores = JSON.parse(localStorage.getItem('whackAFriendScores')) || [];
        this.currentBossDisplay = document.getElementById('currentBoss');
        this.highScoresList = document.getElementById('highScoresList');
        this.bossIndex = -1;
        
        this.level = 1;
        this.targetScore = 100; // 第一关目标分数
        this.speedInterval = 1000; // 初始速度
        this.showTime = 800; // 初始显示时间
        
        // 添加关卡显示
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'level-display';
        document.querySelector('.game-info').appendChild(this.levelDisplay);
        
        this.init();
    }

    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.friends.forEach(friend => {
            friend.addEventListener('click', () => this.whack(friend));
            // 随机分配朋友头像
            const randomImage = this.friendImages[Math.floor(Math.random() * this.friendImages.length)];
            friend.style.backgroundImage = `url(${randomImage})`;
        });
        this.displayHighScores();
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = true;
        this.level = 1;
        this.speedInterval = 1000;
        this.showTime = 800;
        this.targetScore = 100;
        
        this.updateLevelDisplay();
        this.scoreDisplay.textContent = this.score;
        this.startButton.disabled = true;
        
        // 随机选择一个 BOSS
        this.bossIndex = Math.floor(Math.random() * this.friendImages.length);
        this.currentBossDisplay.textContent = `${this.bossIndex + 1}号朋友`;
        
        const bossImage = document.getElementById('bossImage');
        bossImage.src = this.friendImages[this.bossIndex];
        bossImage.style.display = 'block';
        
        this.startLevel();
    }

    startLevel() {
        clearInterval(this.gameInterval);
        
        // 设置关卡难度
        switch(this.level) {
            case 1:
                this.speedInterval = 1000;
                this.showTime = 800;
                this.targetScore = 100;
                break;
            case 2:
                this.speedInterval = 700;
                this.showTime = 500;
                this.targetScore = 250;
                this.timeLeft += 20; // 奖励20秒
                break;
            case 3:
                this.speedInterval = 400;
                this.showTime = 300;
                this.targetScore = 99999; // 不可能达到的分数
                this.timeLeft += 10; // 略微奖励时间
                // 第三关增加额外难度：随机移动位置
                this.friends.forEach(friend => {
                    friend.style.transition = 'all 0.2s';
                });
                break;
        }
        
        this.updateLevelDisplay();
        this.gameInterval = setInterval(() => this.showRandomFriend(), this.speedInterval);
    }

    showRandomFriend() {
        this.friends.forEach(friend => {
            friend.classList.remove('show');
            friend.classList.remove('boss');
            // 第三关添加随机位置
            if (this.level === 3) {
                friend.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
            }
        });
        
        const randomFriend = this.friends[Math.floor(Math.random() * this.friends.length)];
        const isBoss = randomFriend.style.backgroundImage.includes(`${this.bossIndex + 1}.jpg`);
        
        if (isBoss) {
            randomFriend.classList.add('boss');
        }
        
        randomFriend.classList.add('show');
        
        setTimeout(() => {
            if (this.gameActive) randomFriend.classList.remove('show');
        }, this.showTime);
    }

    whack(friend) {
        if (!this.gameActive || !friend.classList.contains('show')) return;
        
        const isBoss = friend.style.backgroundImage.includes(`${this.bossIndex + 1}.jpg`);
        
        if (isBoss) {
            this.score -= 20;
            friend.classList.add('hit-boss');
        } else {
            // 根据关卡增加得分
            const baseScore = 10;
            const levelMultiplier = this.level === 3 ? 5 : this.level;
            this.score += baseScore * levelMultiplier;
            friend.classList.add('hit');
        }
        
        this.scoreDisplay.textContent = this.score;
        friend.classList.remove('show');
        
        // 检查是否达到目标分数
        if (this.score >= this.targetScore && this.level < 3) {
            this.levelUp();
        }
        
        setTimeout(() => {
            friend.classList.remove('hit');
            friend.classList.remove('hit-boss');
        }, 300);
    }

    levelUp() {
        this.level++;
        // 播放升级动画和声音
        this.showLevelUpAnimation();
        this.startLevel();
    }

    showLevelUpAnimation() {
        const levelUpMsg = document.createElement('div');
        levelUpMsg.className = 'level-up-message';
        levelUpMsg.textContent = `升级到第 ${this.level} 关！`;
        document.body.appendChild(levelUpMsg);
        
        setTimeout(() => {
            document.body.removeChild(levelUpMsg);
        }, 2000);
    }

    updateLevelDisplay() {
        this.levelDisplay.innerHTML = `
            <div>当前关卡：${this.level}</div>
            <div>目标分数：${this.targetScore}</div>
        `;
    }

    updateTime() {
        this.timeLeft--;
        this.timeDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    updateHighScores() {
        this.highScores.push({
            score: this.score,
            date: new Date().toLocaleDateString()
        });
        
        // 排序并只保留前5个最高分
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5);
        
        localStorage.setItem('whackAFriendScores', JSON.stringify(this.highScores));
        this.displayHighScores();
    }

    displayHighScores() {
        this.highScoresList.innerHTML = this.highScores
            .map(score => `<li>${score.score}分 - ${score.date}</li>`)
            .join('');
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        clearInterval(this.timeInterval);
        this.friends.forEach(friend => {
            friend.classList.remove('show');
            friend.classList.remove('boss');
            friend.style.transform = 'none';
            friend.style.transition = 'top 0.3s';
        });
        this.startButton.disabled = false;
        document.getElementById('bossImage').style.display = 'none';
        this.currentBossDisplay.textContent = '未开始';
        
        this.updateHighScores();
        alert(`游戏结束！\n最终关卡：${this.level}\n最终得分：${this.score}\nBOSS是${this.bossIndex + 1}号朋友`);
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new WhackAFriend();
}); 