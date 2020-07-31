exports.seed = (knex) =>
  knex('injection_response')
    .del()
    .then(() =>
      knex('injection_response').insert([
        { response_id: 'RP1', injection_id: 'I1' },
        { response_id: 'RP2', injection_id: 'I2' },
        { response_id: 'RP3', injection_id: 'I4' },
        { response_id: 'RP4', injection_id: 'I5' },
        { response_id: 'RP5', injection_id: 'I9' },
        { response_id: 'RP6', injection_id: 'I11' },
        {
          response_id: 'RP7',
          injection_id: 'I13',
        },
        { response_id: 'RP8', injection_id: 'I14' },
        {
          response_id: 'RP9',
          injection_id: 'I18',
        },
        {
          response_id: 'RP10',
          injection_id: 'I19',
        },
        {
          response_id: 'RP11',
          injection_id: 'I20',
        },
        {
          response_id: 'RP12',
          injection_id: 'I22',
        },
        {
          response_id: 'RP13',
          injection_id: 'I25',
        },
        {
          response_id: 'RP14',
          injection_id: 'I25',
        },
        {
          response_id: 'RP15',
          injection_id: 'I26',
        },
        {
          response_id: 'RP16',
          injection_id: 'I34',
        },
        {
          response_id: 'RP17',
          injection_id: 'I36',
        },
        {
          response_id: 'RP18',
          injection_id: 'I46',
        },
        {
          response_id: 'RP19',
          injection_id: 'I50',
        },
        {
          response_id: 'RP20',
          injection_id: 'I51',
        },
        {
          response_id: 'RP21',
          injection_id: 'I54',
        },
        {
          response_id: 'RP22',
          injection_id: 'I56',
        },
        {
          response_id: 'RP23',
          injection_id: 'I59',
        },
        {
          response_id: 'RP24',
          injection_id: 'I61',
        },
        {
          response_id: 'RP25',
          injection_id: 'I64',
        },
        {
          response_id: 'RP26',
          injection_id: 'I67',
        },
        {
          response_id: 'RP27',
          injection_id: 'I57',
        },
        { response_id: 'RP3', injection_id: 'I7' },
        {
          response_id: 'RP28',
          injection_id: 'I8',
        },
        {
          response_id: 'RP3',
          injection_id: 'I12',
        },
        {
          response_id: 'RP28',
          injection_id: 'I16',
        },
        { response_id: 'RP29', injection_id: 'I3' },
        {
          response_id: 'RP11',
          injection_id: 'I32',
        },
        { response_id: 'RP6', injection_id: 'I33' },
        { response_id: 'RP8', injection_id: 'I42' },
        { response_id: 'RP6', injection_id: 'I46' },
        {
          response_id: 'RP13',
          injection_id: 'I46',
        },
        {
          response_id: 'RP11',
          injection_id: 'I56',
        },
        {
          response_id: 'RP19',
          injection_id: 'I56',
        },
        { response_id: 'RP6', injection_id: 'I57' },
        {
          response_id: 'RP13',
          injection_id: 'I57',
        },
      ]),
    );
