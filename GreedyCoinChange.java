import java.util.*;

/**
 * Greedy Algorithm for Coin Change Problem
 * 
 * This algorithm selects the largest coin denomination first and uses as many
 * of those coins as possible before moving to the next smaller denomination.
 * 
 * Time Complexity: O(n log n) for sorting + O(n) for greedy selection = O(n log n)
 * Space Complexity: O(n) for storing the result
 * 
 * Note: Greedy doesn't always give optimal solution for all coin systems.
 * Works optimally for standard denominations like {1, 5, 10, 25, 50, 100}
 */
public class GreedyCoinChange {
    
    /**
     * Result class to store the coins used and remaining amount
     */
    static class CoinChangeResult {
        List<Integer> coinsUsed;
        int remainingAmount;
        
        public CoinChangeResult(List<Integer> coinsUsed, int remainingAmount) {
            this.coinsUsed = coinsUsed;
            this.remainingAmount = remainingAmount;
        }
        
        @Override
        public String toString() {
            return "Coins Used: " + coinsUsed + 
                   "\nTotal Coins: " + coinsUsed.size() + 
                   "\nRemaining Amount: " + remainingAmount;
        }
    }
    
    /**
     * Greedy algorithm to make change for a given amount
     * 
     * @param amount The target amount to make change for
     * @param coins Array of available coin denominations
     * @return CoinChangeResult containing coins used and remaining amount
     */
    public static CoinChangeResult greedyChange(int amount, int[] coins) {
        List<Integer> coinsUsed = new ArrayList<>();
        int remaining = amount;
        
        // Sort coins in descending order (largest first)
        Integer[] coinsSorted = Arrays.stream(coins)
                                      .boxed()
                                      .sorted(Collections.reverseOrder())
                                      .toArray(Integer[]::new);
        
        // Greedy selection: use largest coins first
        for (int coin : coinsSorted) {
            while (remaining >= coin) {
                coinsUsed.add(coin);
                remaining -= coin;
            }
        }
        
        return new CoinChangeResult(coinsUsed, remaining);
    }
    
    /**
     * Main method for testing the Greedy algorithm
     */
    public static void main(String[] args) {
        // Test Case 1: Standard US coins
        System.out.println("========================================");
        System.out.println("TEST CASE 1: Standard US Coins");
        System.out.println("========================================");
        int[] usCoins = {1, 5, 10, 25, 50, 100};
        int amount1 = 93;
        
        CoinChangeResult result1 = greedyChange(amount1, usCoins);
        System.out.println("Amount: " + amount1);
        System.out.println("Denominations: " + Arrays.toString(usCoins));
        System.out.println(result1);
        System.out.println();
        
        // Test Case 2: Indian Rupee denominations
        System.out.println("========================================");
        System.out.println("TEST CASE 2: Indian Rupee");
        System.out.println("========================================");
        int[] indianCoins = {1, 2, 5, 10, 20, 50, 100, 500, 2000};
        int amount2 = 376;
        
        CoinChangeResult result2 = greedyChange(amount2, indianCoins);
        System.out.println("Amount: " + amount2);
        System.out.println("Denominations: " + Arrays.toString(indianCoins));
        System.out.println(result2);
        System.out.println();
        
        // Test Case 3: Demonstrating greedy doesn't always give optimal
        System.out.println("========================================");
        System.out.println("TEST CASE 3: Non-optimal Greedy Example");
        System.out.println("========================================");
        int[] specialCoins = {1, 3, 4};
        int amount3 = 6;
        
        CoinChangeResult result3 = greedyChange(amount3, specialCoins);
        System.out.println("Amount: " + amount3);
        System.out.println("Denominations: " + Arrays.toString(specialCoins));
        System.out.println(result3);
        System.out.println("Note: Greedy uses {4, 1, 1} = 3 coins");
        System.out.println("      Optimal is {3, 3} = 2 coins");
        System.out.println("      This shows greedy doesn't always give optimal solution!");
    }
}
