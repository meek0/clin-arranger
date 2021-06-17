import AdmZip from 'adm-zip';
import Papa from 'papaparse';

const generateTSVArchive = async (
    data,
    columns = undefined
) => {
    const zip = new AdmZip();
    const tsvConfig = {
        delimiter: '\t',
    };

    if (columns) {
        tsvConfig.columns = columns;
    }

    Object.keys(data).forEach((key) => {
        const tsv = Papa.unparse(data[key], tsvConfig);
        zip.addFile(`${key}.tsv`, Buffer.from(tsv, 'utf8'));
    });

    const waitForBuffer = (archive) =>
        new Promise((resolve, reject) => {
            archive.toBuffer(
                (buffer) => resolve(buffer),
                (err) => reject(JSON.stringify(err))
            );
        });

    return await waitForBuffer(zip);
}

export default generateTSVArchive;