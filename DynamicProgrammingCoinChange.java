import java.util.*;

/**
 * Dynamic Programming Algorithm for Coin Change Problem
 * 
 * This algorithm finds the OPTIMAL (minimum) number of coins needed to make
 * change for a given amount using dynamic programming approach.
 * 
 * Time Complexity: O(amount * coins.length)
 * Space Complexity: O(amount)
 * 
 * Unlike greedy, DP ALWAYS finds the optimal solution for any coin system.
 */
public class DynamicProgrammingCoinChange {
    
    /**
     * Result class to store the optimal solution
     */
    static class DPResult {
        List<Integer> coinsUsed;
        int minCoins;
        boolean isPossible;
        
        public DPResult(List<Integer> coinsUsed, int minCoins, boolean isPossible) {
            this.coinsUsed = coinsUsed;
            this.minCoins = minCoins;
            this.isPossible = isPossible;
        }
        
        @Override
        public String toString() {
            if (!isPossible) {
                return "Not possible to make this amount with given coins";
            }
            return "Coins Used: " + coinsUsed + 
                   "\nMinimum Coins: " + minCoins + 
                   "\nBreakdown: " + getBreakdown();
        }
        
        private String getBreakdown() {
            if (coinsUsed.isEmpty()) return "None";
            
            Map<Integer, Integer> countMap = new TreeMap<>(Collections.reverseOrder());
            for (int coin : coinsUsed) {
                countMap.put(coin, countMap.getOrDefault(coin, 0) + 1);
            }
            
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
                if (sb.length() > 0) sb.append(" + ");
                sb.append(entry.getValue()).append("×").append(entry.getKey());
            }
            return sb.toString();
        }
    }
    
    /**
     * Dynamic Programming algorithm to find minimum coins needed
     * 
     * @param amount The target amount to make change for
     * @param coins Array of available coin denominations
     * @return DPResult containing optimal coins and count
     */
    public static DPResult dpMinCoins(int amount, int[] coins) {
        final int INF = Integer.MAX_VALUE - 1;
        
        // dp[i] = minimum coins needed to make amount i
        int[] dp = new int[amount + 1];
        // choice[i] = which coin was used to reach amount i optimally
        int[] choice = new int[amount + 1];
        
        // Initialize DP array
        Arrays.fill(dp, INF);
        Arrays.fill(choice, -1);
        dp[0] = 0;
        
        // Build up solution from 0 to amount
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i && dp[i - coin] + 1 < dp[i]) {
                    dp[i] = dp[i - coin] + 1;
                    choice[i] = coin;
                }
            }
        }
        
        // Check if solution exists
        if (dp[amount] >= INF) {
            return new DPResult(new ArrayList<>(), -1, false);
        }
        
        // Reconstruct the coins used
        List<Integer> coinsUsed = new ArrayList<>();
        int current = amount;
        while (current > 0) {
            int coinUsed = choice[current];
            coinsUsed.add(coinUsed);
            current -= coinUsed;
        }
        
        return new DPResult(coinsUsed, dp[amount], true);
    }
    
    /**
     * Prints a detailed DP table showing how solution was built
     */
    public static void printDPTable(int amount, int[] coins) {
        final int INF = Integer.MAX_VALUE - 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        
        System.out.println("\nDP Table Visualization:");
        System.out.println("Amount -> Min Coins Needed");
        System.out.println("----------------------------");
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i && dp[i - coin] + 1 < dp[i]) {
                    dp[i] = dp[i - coin] + 1;
                }
            }
            
            if (dp[i] < INF) {
                System.out.printf("%4d  ->  %2d coins%n", i, dp[i]);
            } else {
                System.out.printf("%4d  ->  Not possible%n", i);
            }
        }
    }
    
    /**
     * Main method for testing the DP algorithm
     */
    public static void main(String[] args) {
        // Test Case 1: Standard coins
        System.out.println("========================================");
        System.out.println("TEST CASE 1: Standard US Coins");
        System.out.println("========================================");
        int[] usCoins = {1, 5, 10, 25, 50, 100};
        int amount1 = 93;
        
        DPResult result1 = dpMinCoins(amount1, usCoins);
        System.out.println("Amount: " + amount1);
        System.out.println("Denominations: " + Arrays.toString(usCoins));
        System.out.println(result1);
        System.out.println();
        
        // Test Case 2: Showing DP finds optimal when greedy fails
        System.out.println("========================================");
        System.out.println("TEST CASE 2: DP vs Greedy (Optimal)");
        System.out.println("========================================");
        int[] specialCoins = {1, 3, 4};
        int amount2 = 6;
        
        DPResult result2 = dpMinCoins(amount2, specialCoins);
        System.out.println("Amount: " + amount2);
        System.out.println("Denominations: " + Arrays.toString(specialCoins));
        System.out.println(result2);
        System.out.println("\nComparison:");
        System.out.println("  Greedy would use: {4, 1, 1} = 3 coins");
        System.out.println("  DP finds optimal: {3, 3} = 2 coins ✓");
        System.out.println();
        
        // Test Case 3: Indian Rupee with DP table
        System.out.println("========================================");
        System.out.println("TEST CASE 3: Indian Rupee with DP Table");
        System.out.println("========================================");
        int[] indianCoins = {1, 2, 5, 10, 20, 50, 100};
        int amount3 = 15;
        
        DPResult result3 = dpMinCoins(amount3, indianCoins);
        System.out.println("Amount: " + amount3);
        System.out.println("Denominations: " + Arrays.toString(indianCoins));
        System.out.println(result3);
        
        printDPTable(amount3, indianCoins);
        System.out.println();
        
        // Test Case 4: Impossible case
        System.out.println("========================================");
        System.out.println("TEST CASE 4: Impossible Case");
        System.out.println("========================================");
        int[] limitedCoins = {3, 5};
        int amount4 = 7;
        
        DPResult result4 = dpMinCoins(amount4, limitedCoins);
        System.out.println("Amount: " + amount4);
        System.out.println("Denominations: " + Arrays.toString(limitedCoins));
        System.out.println(result4);
        System.out.println("Note: Cannot make 7 using only coins of 3 and 5");
    }
}
