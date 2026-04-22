const VulnService = require('../services/vuln.service');

class VulnController {
  constructor(vulnService = new VulnService()) {
    this.vulnService = vulnService;
    this.eval = this.eval.bind(this);
    this.cmd = this.cmd.bind(this);
    this.sqli = this.sqli.bind(this);
    this.ssrf = this.ssrf.bind(this);
    this.xxe = this.xxe.bind(this);
  }

  eval(req, res, next) {
    try {
      const result = this.vulnService.evalExpression(req.query.expr);
      res.json({ result });
    } catch (error) {
      next(error);
    }
  }

  async cmd(req, res, next) {
    try {
      const output = await this.vulnService.commandExec(req.query.host || '127.0.0.1');
      res.json({ output });
    } catch (error) {
      next(error);
    }
  }

  async sqli(req, res, next) {
    try {
      const rows = await this.vulnService.rawQuery(req.query.email || '');
      res.json({ rows });
    } catch (error) {
      next(error);
    }
  }

  async ssrf(req, res, next) {
    try {
      const data = await this.vulnService.fetchUrl(req.query.url);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  xxe(req, res, next) {
    try {
      const parsed = this.vulnService.parseXml(req.body.xml || '');
      res.json(parsed);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VulnController;
