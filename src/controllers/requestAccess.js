import { studyDataByStudyId } from '../queries';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import generateTSVArchive from '../services/tsvArchive';
import filesize from 'filesize';

const requestAccessByStudyId = async (req, res, next) => {
    const requestData = await studyDataByStudyId(req.params['studyId'], req.userToken);
    const data = get(requestData, `viewer.Study.hits.edges[0].node`, {});
    if (isEmpty(data)) {
        res.status(400).json();
    }
    const filesToTSV = {
        study: data.files.hits.edges.map((item) => {
            const { file_size, ...rest } = item.node;
            const fileSize = filesize(file_size * 1000 ** 2, {base: 10})
            return {name: data.name, file_size: fileSize, ...rest}
        }),
        access: [
            {
                name: data.name, 
                access_limitations: data.data_access_codes.access_limitations, 
                access_requirements: data.data_access_codes.access_requirements
            }
        ]
    };
    
    const zipData = await generateTSVArchive(filesToTSV);
    res.set({
        'Content-Disposition': 'attachment; filename=request-access.zip',
        'Content-Type': 'application/octet-stream',
    });

    return res.send(zipData);

}
  
export default requestAccessByStudyId;