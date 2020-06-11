// STATIC CONTENT
exports.seed = (knex) => knex('system').del()
  .then(() => knex('system').insert([
    {
      id: 'S1',
      name: 'Party website',
      description: '',
      type: 'Party',
    },
    {
      id: 'S2',
      name: 'HQ Facebook',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S3',
      name: 'HQ Twitter',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S4',
      name: 'HQ Member Database',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S5',
      name: 'HQ Computers',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S6',
      name: 'HQ Phones',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S7',
      name: 'LB Facebook',
      description: '',
      type: 'LB',
    },
    {
      id: 'S8',
      name: 'LB Member Files',
      description: '',
      type: 'LB',
    },
    {
      id: 'S9',
      name: 'LB Computers',
      description: '',
      type: 'LB',
    },
    {
      id: 'S10',
      name: 'LB Phones',
      description: '',
      type: 'LB',
    },
    {
      id: 'S11',
      name: 'HQ Campaign Ability',
      description: '',
      type: 'HQ',
    },
    {
      id: 'S12',
      name: 'LB Campaign Ability',
      description: '',
      type: 'LB',
    },
  ]));
