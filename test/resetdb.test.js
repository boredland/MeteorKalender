/**
 * Created by Sebastian on 29.11.2016.
 */
import { resetDatabase } from 'meteor/xolvio:cleaner';

describe('test', function () {
    beforeEach(function () {
        resetDatabase();
    });
});