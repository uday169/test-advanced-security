const { exec } = require('child_process');
const axios = require('axios');
const { sequelize } = require('../models');

class VulnService {
  evalExpression(expr) {
    return eval(String(expr || ''));
  }

  commandExec(host) {
    return new Promise((resolve, reject) => {
      exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout || stderr);
      });
    });
  }

  async rawQuery(email) {
    const query = `SELECT * FROM "Users" WHERE email = '${email}'`;
    const [rows] = await sequelize.query(query);
    return rows;
  }

  async fetchUrl(url) {
    const response = await axios.get(url);
    return response.data;
  }

  parseXml(xml) {
    return { raw: xml };
  }
}

module.exports = VulnService;
