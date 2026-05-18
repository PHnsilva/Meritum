function createError(message: string, name: string): Error {
  const err = new Error(message);
  err.name = name;
  return err;
}

export const DomainErrors = {
  professorNotFound: () => createError('Professor nao encontrado', 'ProfessorNotFoundError'),
  studentNotFound: () => createError('Aluno nao encontrado', 'StudentNotFoundError'),
  institutionNotFound: () => createError('Instituicao de ensino nao encontrada', 'InstitutionNotFoundError'),
  insufficientBalance: () => createError('Saldo insuficiente para realizar o envio', 'InsufficientBalanceError'),
  differentInstitution: () => createError('Professor e aluno nao pertencem a mesma instituicao', 'DifferentInstitutionError'),
  userNotFound: () => createError('Usuario nao encontrado', 'UserNotFoundError'),
  partnerNotFound: () => createError('Empresa parceira nao encontrada', 'PartnerNotFoundError'),
  accountPending: () => createError('Conta aguardando aprovacao da administracao', 'AccountPendingError'),
  advantageNotFound: () => createError('Vantagem nao encontrada', 'AdvantageNotFoundError'),
  advantageInactive: () => createError('Vantagem nao esta disponivel para resgate', 'AdvantageInactiveError'),
  advantageOwnership: () => createError('Voce nao tem permissao para modificar esta vantagem', 'AdvantageOwnershipError'),
};
