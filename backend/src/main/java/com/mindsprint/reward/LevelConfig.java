package com.mindsprint.reward;

public class LevelConfig {
    public static int getRequiredXpForLevel(int level) {
        switch (level) {
            case 1: return 0;
            case 2: return 100;
            case 3: return 250;
            case 4: return 500;
            case 5: return 1000;
            default:
                if (level < 1) return 0;
                // For level > 5, a simple formula: previous + 500
                return 1000 + (level - 5) * 500;
        }
    }
    
    public static int calculateLevelFromXp(int xp) {
        int level = 1;
        while (xp >= getRequiredXpForLevel(level + 1)) {
            level++;
        }
        return level;
    }
}
