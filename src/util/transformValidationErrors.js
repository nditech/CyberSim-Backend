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

module.exports = transformValidationErrors;
