/**
 * Transaction Boundary — Explicit aggregate boundaries
 * Marks where transactions should begin/end
 */

export const TRANSACTION_BOUNDARIES = {
  /**
   * Coin sending spans Student + Professor aggregates
   * Must be atomic: debit professor OR credit student, not partial
   */
  COIN_TRANSFER: {
    aggregates: ['Professor', 'Student'],
    critical: true,
    description: 'Professor sends coins to Student — both balances must update atomically'
  },

  /**
   * Advantage redemption spans Student + Advantage aggregates
   * Must be atomic: deduct coins AND create redemption together
   */
  ADVANTAGE_REDEMPTION: {
    aggregates: ['Student', 'Advantage'],
    critical: true,
    description: 'Student redeems advantage — coins deducted + redemption created atomically'
  },

  /**
   * User authentication spans User aggregate only
   * Single aggregate, no cross-aggregate transaction needed
   */
  USER_LOGIN: {
    aggregates: ['User'],
    critical: false,
    description: 'Login is read-only on User aggregate, no state changes'
  },

  /**
   * Partner approval spans Partner aggregate only
   * Single aggregate state change
   */
  PARTNER_APPROVAL: {
    aggregates: ['Partner'],
    critical: false,
    description: 'Approve Partner — single aggregate, safe to split if needed'
  },

  /**
   * Institution creation spans Institution + User aggregates
   * Must be atomic: User created OR Institution created, not partial
   */
  INSTITUTION_REGISTRATION: {
    aggregates: ['User', 'Institution'],
    critical: true,
    description: 'Register Institution — user + institution must be created together'
  }
};

/**
 * Usage: Document in services where transactions are critical
 *
 * ```ts
 * async enviarMoedas(input) {
 *   // TRANSACTION BOUNDARY: See TRANSACTION_BOUNDARIES.COIN_TRANSFER
 *   // This operation MUST be atomic — if either debit or credit fails,
 *   // both must roll back to maintain consistency
 *
 *   await uow.run(async (tx) => {
 *     await professorPort.deductBalance(..., tx);
 *     await studentPort.addBalance(..., tx);
 *   });
 * }
 * ```
 */
