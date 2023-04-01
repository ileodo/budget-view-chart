/**
 * Type describing the budget data
 */
export interface BudgetRecord {
  /**
   * Name of the budget item
   */
  name: string

  /**
   * Description of the budget item
   */
  description: string

  /**
   * Monthly Budget for this budget item
   */
  monthlyBudget: number

  /**
   * Monthly Amount for this budget item.
   * 12 elements are required.
   */
  monthlyAmount: number[]
}
