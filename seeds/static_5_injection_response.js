exports.seed = (knex) =>
  knex('injection_response')
    .del()
    .then(() =>
      knex('injection_response').insert([
        { response_id: 'RP1', injection_id: 'I1', injection_to_prevent: 'I34' },
        { response_id: 'RP2', injection_id: 'I2', injection_to_prevent: null },
        { response_id: 'RP3', injection_id: 'I4', injection_to_prevent: 'I27' },
        { response_id: 'RP4', injection_id: 'I5', injection_to_prevent: 'I59' },
        { response_id: 'RP5', injection_id: 'I9', injection_to_prevent: 'I20' },
        { response_id: 'RP6', injection_id: 'I11', injection_to_prevent: null },
        {
          response_id: 'RP7',
          injection_id: 'I13',
          injection_to_prevent: 'I50',
        },
        { response_id: 'RP8', injection_id: 'I14', injection_to_prevent: null },
        {
          response_id: 'RP9',
          injection_id: 'I18',
          injection_to_prevent: 'I30',
        },
        {
          response_id: 'RP10',
          injection_id: 'I19',
          injection_to_prevent: 'I31',
        },
        {
          response_id: 'RP11',
          injection_id: 'I20',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP12',
          injection_id: 'I22',
          injection_to_prevent: 'I40',
        },
        {
          response_id: 'RP13',
          injection_id: 'I25',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP14',
          injection_id: 'I25',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP15',
          injection_id: 'I26',
          injection_to_prevent: 'I51',
        },
        {
          response_id: 'RP16',
          injection_id: 'I34',
          injection_to_prevent: 'I36',
        },
        {
          response_id: 'RP17',
          injection_id: 'I36',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP18',
          injection_id: 'I46',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP19',
          injection_id: 'I50',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP20',
          injection_id: 'I51',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP21',
          injection_id: 'I54',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP22',
          injection_id: 'I56',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP23',
          injection_id: 'I59',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP24',
          injection_id: 'I61',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP25',
          injection_id: 'I64',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP26',
          injection_id: 'I67',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP27',
          injection_id: 'I57',
          injection_to_prevent: null,
        },
        { response_id: 'RP3', injection_id: 'I7', injection_to_prevent: 'I23' },
        {
          response_id: 'RP28',
          injection_id: 'I8',
          injection_to_prevent: 'I24',
        },
        {
          response_id: 'RP3',
          injection_id: 'I12',
          injection_to_prevent: 'I14',
        },
        {
          response_id: 'RP28',
          injection_id: 'I16',
          injection_to_prevent: 'I25',
        },
        { response_id: 'RP29', injection_id: 'I3', injection_to_prevent: null },
        {
          response_id: 'RP11',
          injection_id: 'I32',
          injection_to_prevent: null,
        },
        { response_id: 'RP6', injection_id: 'I33', injection_to_prevent: null },
        { response_id: 'RP8', injection_id: 'I42', injection_to_prevent: null },
        { response_id: 'RP6', injection_id: 'I46', injection_to_prevent: null },
        {
          response_id: 'RP13',
          injection_id: 'I46',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP11',
          injection_id: 'I56',
          injection_to_prevent: null,
        },
        {
          response_id: 'RP19',
          injection_id: 'I56',
          injection_to_prevent: null,
        },
        { response_id: 'RP6', injection_id: 'I57', injection_to_prevent: null },
        {
          response_id: 'RP13',
          injection_id: 'I57',
          injection_to_prevent: null,
        },
      ]),
    );
