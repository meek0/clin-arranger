import { expect } from "chai";
import { singleVariantReport, multiVariantReport } from "../app/controllers/transcriptsReportHandler.js"

describe('multiVariantReport', () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { patientId: '123' },
        body: {}
      };
      res = {
        sendStatus: function(statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        send: function(response) {
          this.response = response;
        },
        setHeader: function(header) {
          this.header = header;
        },
        end: function() {
        },
      };
    });

    it('should return bad request if body is missing', async () => {
      req.body = null;
      await multiVariantReport(req, res);
      expect(res.statusCode).to.equal(400);
    });

    it('should return bad request if variantIds is missing', async () => {
      req.body = {};
      await multiVariantReport(req, res);
      expect(res.statusCode).to.equal(400);
    });

    it('should return bad request if variantIds is empty', async () => {
      req.body = { variantIds: [] };
      await multiVariantReport(req, res);
      expect(res.statusCode).to.equal(400);
    });

    it('should return bad request if variantIds contains illegal character', async () => {
        req.body = { variantIds: ['variant1@@@!!'] };
        await multiVariantReport(req, res);
        expect(res.statusCode).to.equal(400);
      });

      it("should return bad request if variantIds has more than 100 elements", async () => {
        const variantIds = [];
        for (let i = 1; i <= 101; i++) {
          variantIds.push(i);
        }
        req.body = { variantIds: [] };
        await multiVariantReport(req, res);
        expect(res.statusCode).to.equal(400);
      });
  });