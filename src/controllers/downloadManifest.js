import { studyDataByStudyId } from '../queries';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import generateTSVArchive from '../services/tsvArchive';

const downloadManifestByStudyId = async (req, res, next) => {
    const requestData = await studyDataByStudyId(req.params['studyId'], req.userToken);
    const data = get(requestData, `viewer.Study.hits.edges[0].node`, {});
    if (isEmpty(data)) {
        res.status(400).json();
    }
    const filesToTSV = {
        manifest: data.files.hits.edges.map((item) => {
            return {file_id: item.node.internal_file_id}
        }),
    };
    
    const zipData = await generateTSVArchive(filesToTSV);
    res.set({
        'Content-Disposition': 'attachment; filename=manifest.zip',
        'Content-Type': 'application/octet-stream',
    });

    return res.send(zipData);

}
  
export default downloadManifestByStudyId;