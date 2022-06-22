function transformValidationError(validationError) {
  return validationError.errors.map((error) => {
    const [id, message] = error.split('.');
    const idx = Number(id.slice(1, -1));
    return {
      value: validationError.value[idx],
      message: `${message} in ${validationError.tableName}`,
    };
  });
}

function transformValidationErrors(validationErrors) {
  if (Array.isArray(validationErrors)) {
    return validationErrors.map(transformValidationError).flat();
  }
  return transformValidationError(validationErrors);
}

function throwNecessaryValidationErrors(validationResponses, message) {
  const errors = validationResponses
    .filter((table) => table.status === 'rejected')
    .map((error) => error.reason);
  if (errors.length) {
    errors.message = message;
    errors.validation = true;
    throw errors;
  }
}

module.exports = {
  transformValidationErrors,
  throwNecessaryValidationErrors,
};
