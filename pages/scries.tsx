import React, { useState } from 'react';
import _ from 'lodash';
import styles from '../styles/scries.module.css';

interface ScryParameters {
  [param: string]: {
    format: string;
    description: string;
    example?: string;
  };
}

interface ScryResult {
  mark: string;
  description: string;
  summary?: string;
}
interface ScryDoc {
  [path: string]: ScryPath;
}

interface ScryPath {
  parameters: ScryParameters;
  result?: ScryResult;
  children: ScryDoc;
}
interface ScriesProps {
  scries: ScryDoc;
}

function getExamplePath(path: string, parameters: ScryParameters) {
  return path
    .split('/')
    .map((seg) => {
      if (seg.startsWith('[') && seg.endsWith('+]')) {
        const param = parameters[seg.slice(1, -2)];
        return param?.example || param?.format;
      }
      if (seg.startsWith('[') && seg.endsWith(']')) {
        const param = parameters[seg.slice(1, -1)];
        return param?.example || param?.format;
      }
      return seg;
    })
    .join('/');
}

function Scry(props: { doc: ScryPath; path: string }) {
  const { doc, path } = props;
  const { parameters = {}, result } = doc;
  const [expand, setExpand] = useState(false);
  const onClick = () => {
    setExpand((e) => !e);
  };

  return (
    <div className="container">
      <div className="pv2" onClick={onClick}>
        <span className="code">{path}</span> {result?.summary ?? ''}
      </div>
      {expand ? (
        <>
          {Object.keys(parameters).length > 0 ? (
            <div className="container">
              <span className="emph">Parameters</span>
              <div>
                {_.map(parameters, ({ description, format }, param) => (
                  <div key={param}>
                    {param} - {description}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {result ? (
            <div className="container">
              <span className="emph">Result</span>
              mark - {result.mark}
              <br />
              {result.description}
            </div>
          ) : null}
          <div className="container">
            <span className="emph">Example</span>
            <span className="code">{getExamplePath(path, parameters)}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
const NODE_PARAMS = {
  index: {
    description:
      'The index of the node being requested, formatted as a list of @ud',
    format: 'path',
    example: '123.456/789',
  },
};
const KITH_PARAMS = {
  mode: {
    format: 'cord',
    description:
      'Either `kith` or `lone`. If lone, then all the response will not include the descendants of the requested nodes',
    example: 'kith',
  },
};
const SUBSET_PARAMS = {
  start: {
    description:
      'An atom to start the subset at. If unable to be parsed as an atom, the subset will start at the smallest node',
    format: 'decimal',
    example: '492',
  },
  end: {
    description:
      'An atom to end the subset at. If unable to be parsed as an atom, the subset will start at the largest node',
    format: 'decimal',
    example: '726',
  },
};

export const DEFAULT_SCRIES: ScryDoc = {
  '/graph/[ship]/[name]': {
    parameters: {
      ship: {
        format: 'ship',
        description: 'Host of graph being requested',
        example: '~dopzod',
      },
      name: {
        format: 'cord',
        description: 'Name of graph being requested',
        example: 'urbit-community',
      },
    },
    children: {
      '/mark': {
        result: {
          mark: 'noun',
          description: 'A `(unit mark)` representing the mark of the graph',
          summary: 'Request the mark of a graph',
        },
        children: {},
        parameters: {},
      },
      '/subset/[mode]/[start]/[end]': {
        result: {
          mark: 'graph-update-2',
          description: 'An `%add-nodes update containing the subset requested',
          summary: 'Request a subset of the graph',
        },
        children: {},
        parameters: {
          ...KITH_PARAMS,
          ...SUBSET_PARAMS,
        },
      },
      '/node': {
        parameters: {},
        children: {
          '/exists/[index+]': {
            parameters: NODE_PARAMS,
            children: {},
            result: {
              mark: 'noun',
              summary: 'Check if node exists',
              description:
                'A flag indicating whether the requested node exists',
            },
          },
          '/index/[mode]/[index+]': {
            parameters: {
              ...NODE_PARAMS,
              ...KITH_PARAMS,
            },
            result: {
              description: 'An %add-nodes update containing the node requested',
              summary: 'Request a node',
              mark: 'graph-update-2',
            },
            children: {},
          },
          '/children/[mode]/[start]/[end]/[index+]': {
            result: {
              description:
                'An %add-nodes update containing the children of the requested node',
              mark: 'graph-update-2',
              summary: "Request a node's children",
            },
            children: {},
            parameters: {
              ...NODE_PARAMS,
              ...KITH_PARAMS,
              ...SUBSET_PARAMS,
            },
          },
          '/siblings/[direction]/[mode]/[count]/[index+]': {
            result: {
              summary: "Request a node's siblings",
              description:
                'An %add-nodes update containing the siblings of the requested node',
              mark: 'graph-update-2',
            },
            parameters: {
              ...KITH_PARAMS,
              ...NODE_PARAMS,
              count: {
                description: 'A limit for the number of nodes returned',
                example: '100',
                format: 'atom',
              },
              direction: {
                description:
                  "Either 'older' or 'newer'. If newer, then load the siblings with keys that are larger than the requested node. Else, load the siblings with smaller keys",
                example: 'older',
                format: 'cord',
              },
            },
          },
          '/siblings/[edge]/[mode]/[count]/[index+]': {
            result: {
              summary: "Request a node's children, starting at an edge",
              description:
                'An %add-nodes update containing the children of the requested node',
              mark: 'graph-update-2',
            },
            parameters: {
              ...KITH_PARAMS,
              ...NODE_PARAMS,
              count: {
                description: 'A limit for the number of nodes returned',
                example: '100',
                format: 'atom',
              },
              edge: {
                description:
                  "Either 'oldest' or 'newest'. If oldest, start returning the children with the smallest keys. Else, return the children with the largest keys.",
                example: 'newest',
                format: 'atom',
              },
            },
          },
        },
      },
    },
  },
};

function flattenScryDoc(
  doc: ScryDoc,
  parentPath = '',
  params = {} as ScryParameters
) {
  let result = {};
  for (let path in doc) {
    const paramDoc = doc[path];
    const flatParams = { ...params, ...paramDoc.parameters };
    const flatDoc = { ...paramDoc, parameters: flatParams };
    const absPath = `${parentPath}${path}`;

    if ('result' in paramDoc) {
      result[absPath] = flatDoc;
    }
    if ('children' in paramDoc) {
      Object.assign(
        result,
        flattenScryDoc(paramDoc.children, absPath, flatParams)
      );
    }
  }
  return result;
}

export default function Scries(props: ScriesProps) {
  const { scries = DEFAULT_SCRIES } = props;

  return (
    <div>
      {_.map(flattenScryDoc(scries), (scry, path) => (
        <Scry key={path} path={path} doc={scry} />
      ))}
    </div>
  );
}
