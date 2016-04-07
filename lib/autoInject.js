import auto from './auto';
import forOwn from 'lodash/forOwn';
import arrayMap from 'lodash/_arrayMap';
import clone from 'lodash/_copyArray';
import isArray from 'lodash/isArray';

var argsRegex =  /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

function parseParams(func) {
    return  func.toString().match(argsRegex)[1].split(/\s*\,\s*/);
}

export default function autoInject(tasks, callback) {
    var newTasks = {};

    forOwn(tasks, function (taskFn, key) {
        var params;

        if (isArray(taskFn)) {
            params = clone(taskFn);
            taskFn = params.pop();

            newTasks[key] = params.concat(newTask);
        } else if (taskFn.length === 0) {
            throw new Error("autoInject task functions require explicit parameters.");
        } else if (taskFn.length === 1) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            taskFn.apply(null, newArgs);
        }
    });

    auto(newTasks, function (err, results) {
        var params;
        if (isArray(callback)) {
            params = clone(callback);
            callback = params.pop();
        } else {
            params = parseParams(callback);
            params.shift();
        }

        params = arrayMap(params, function (name) {
            return results[name];
        });

        params.unshift(err);
        callback.apply(null, params);
    });
}
