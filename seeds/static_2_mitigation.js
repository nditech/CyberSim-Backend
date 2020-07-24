exports.seed = (knex) =>
  knex('mitigation')
    .del()
    .then(() =>
      knex('mitigation').insert([
        {
          id: 'M1',
          description:
            'Install lockable filing cabinets to store sensitive material at Party office',
          is_hq: true,
          is_local: true,
          hq_cost: 500,
          local_cost: 500,
          category: 'Operation',
        },
        {
          id: 'M2',
          description: 'Install strong lock on Party office doors and windows',
          is_hq: true,
          is_local: true,
          hq_cost: 250,
          local_cost: 250,
          category: 'Operation',
        },
        {
          id: 'M3',
          description:
            'Establish and enforce policy to regularly change office locks',
          is_hq: true,
          is_local: true,
          hq_cost: 250,
          local_cost: 250,
          category: 'Operation',
        },
        {
          id: 'M4',
          description:
            'Create a secure backup for the online party voter database',
          is_hq: true,
          is_local: false,
          hq_cost: 1500,
          category: 'National party voter database',
        },
        {
          id: 'M5',
          description:
            'Require two-factor authentication and strong passwords for accessing the online party voter database',
          is_hq: true,
          is_local: false,
          hq_cost: 750,
          category: 'National party voter database',
        },
        {
          id: 'M6',
          description:
            'Establish and enforce an account management and offboarding policy for the online party voter database',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'National party voter database',
        },
        {
          id: 'M7',
          description: 'Set up DDOS protection for Party website',
          is_hq: true,
          is_local: false,
          hq_cost: 1000,
          category: 'National party website',
        },
        {
          id: 'M8',
          description:
            'Host the Party website with a secure web-hosting provider',
          is_hq: true,
          is_local: false,
          hq_cost: 750,
          category: 'National party website',
        },
        {
          id: 'M9',
          description:
            'Require two-factor authentication for logging into the Party website',
          is_hq: true,
          is_local: false,
          hq_cost: 750,
          category: 'National party website',
        },
        {
          id: 'M10',
          description:
            'Establish and enforce a content management policy for the Party website',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'National party website',
        },
        {
          id: 'M11',
          description:
            "Use a reputable cloud-based email service (such as Gsuite or Microsoft Office 365) for staff's Purple Party (@purple_party.org) email accounts",
          is_hq: true,
          is_local: false,
          hq_cost: 1500,
          category: 'Accounts',
        },
        {
          id: 'M12',
          description:
            'Require two-factor authentication and strong passwords for all Party email accounts',
          is_hq: true,
          is_local: true,
          hq_cost: 1500,
          local_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M13',
          description: 'Require strong passwords for all Party email accounts',
          is_hq: true,
          is_local: true,
          hq_cost: 500,
          local_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M14',
          description:
            "Require two-factor authentication for Alissa Orme's personal email account",
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M15',
          description:
            "Require a strong password for Alissa Orme's personal email account",
          is_hq: true,
          is_local: false,
          hq_cost: 250,
          category: 'Accounts',
        },
        {
          id: 'M16',
          description:
            'Require two-factor authentication and strong password for Party Twitter account',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M17',
          description: 'Require strong password for Party Twitter account',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M18',
          description:
            'Establish and enforce Twitter account management policy',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M19',
          description:
            'Require two-factor authentication and strong password on all administrator accounts for Party Facebook pages',
          is_hq: true,
          is_local: true,
          hq_cost: 1000,
          local_cost: 1000,
          category: 'Accounts',
        },
        {
          id: 'M20',
          description:
            'Require strong passwords on all administrator accounts for Party Facebook pages',
          is_hq: true,
          is_local: true,
          hq_cost: 500,
          local_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M21',
          description:
            'Establish and enforce Facebook account management and offboarding policies',
          is_hq: true,
          is_local: false,
          hq_cost: 1250,
          category: 'Accounts',
        },
        {
          id: 'M22',
          description:
            'Establish and enforce communications policy across all Party Facebook pages',
          is_hq: true,
          is_local: false,
          hq_cost: 500,
          category: 'Accounts',
        },
        {
          id: 'M23',
          description:
            'Establish and enforce WhatsApp group management and offboarding policies',
          is_hq: true,
          is_local: true,
          hq_cost: 1000,
          local_cost: 750,
          category: 'Accounts',
        },
        {
          id: 'M24',
          description:
            'Establish secure backup solutions for all Party devices and data; require regular backups by all Party staff/volunteers',
          is_hq: true,
          is_local: true,
          hq_cost: 1500,
          local_cost: 1500,
          category: 'Devices',
        },
        {
          id: 'M25',
          description:
            'Purchase and monitor an advanced malware detection system on all Party staff/volunteer computers',
          is_hq: true,
          is_local: true,
          hq_cost: 3000,
          local_cost: 3000,
          category: 'Devices',
        },
        {
          id: 'M26',
          description:
            'Purchase and monitor a mobile phone device management system on all Party staff/volunteer mobile devices',
          is_hq: true,
          is_local: true,
          hq_cost: 1000,
          local_cost: 750,
          category: 'Devices',
        },
        {
          id: 'M27',
          description:
            'Enforce policy requiring all Party staff/volunteers to lock mobile phones',
          is_hq: true,
          is_local: true,
          hq_cost: 1000,
          local_cost: 1000,
          category: 'Devices',
        },
        {
          id: 'M28',
          description:
            'Enforce policy requiring all Party staff/volunteers to lock computers',
          is_hq: true,
          is_local: true,
          hq_cost: 1000,
          local_cost: 1000,
          category: 'Devices',
        },
        {
          id: 'M29',
          description:
            'Regularly update operating system on all Party staff/volunteer computers',
          is_hq: true,
          is_local: true,
          hq_cost: 750,
          local_cost: 1250,
          category: 'Devices',
        },
        {
          id: 'M30',
          description:
            'Only allow approved software on all Party staff/volunteer computers',
          is_hq: true,
          is_local: true,
          hq_cost: 750,
          local_cost: 750,
          category: 'Devices',
        },
        {
          id: 'M31',
          description:
            'Only allow approved apps on all Party staff/volunteer mobile devices',
          is_hq: true,
          is_local: true,
          hq_cost: 750,
          local_cost: 750,
          category: 'Devices',
        },
      ]),
    );
