import mapValuesLimit from './mapValuesLimit';
import doLimit from './internal/doLimit';

export default doLimit(mapValuesLimit, Infinity);
