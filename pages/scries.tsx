import React, { useState } from 'react';
import _ from 'lodash';
import Head from 'next/head';

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

function getSegmentVar(seg: string) {
  if (seg.startsWith('[') && seg.endsWith('+]')) {
    return seg.slice(1, -2);
  }
  if (seg.startsWith('[') && seg.endsWith(']')) {
    return seg.slice(1, -1);
  }
}

function getExamplePath(path: string, parameters: ScryParameters) {
  return path
    .split('/')
    .map((seg) => {})
    .join('/');
}
const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'];

function Path(props: { path: string }) {
  const { path } = props;
  const [segments] = _.reduce(
    path.split('/'),
    ([segs, count], seg, idx) => {
      const newSegs = idx === 0 ? [...segs] : [...segs, '/'];
      if (seg.length === 0) {
        return [segs, count];
      }
      if (seg.startsWith('[')) {
        const color = colors[count];
        newSegs.push(
          <span key={seg} className={`text-${color}`}>
            {seg}
          </span>
        );

        return [newSegs, count + 1];
      }
      return [[...newSegs, <span key={seg}>{seg}</span>], count];
    },
    [[], 0] as [JSX.Element[], number]
  );

  return <div className="p-2 rounded bg-washedGray font-mono">{segments}</div>;
}

function ExamplePath(props: { path: string; params: ScryParameters }) {
  const { path, params } = props;
  const [segments] = _.reduce(
    path.split('/'),
    ([segs, count], seg, idx) => {
      const newSegs = idx === 0 ? [...segs] : [...segs, '/'];
      if (seg.length === 0) {
        return [segs, count];
      }
      const segVar = getSegmentVar(seg);
      if (segVar) {
        const color = colors[count];
        newSegs.push(
          <span key={seg} className={`text-${color}`}>
            {params[segVar].example}
          </span>
        );

        return [newSegs, count + 1];
      }
      return [[...newSegs, <span key={seg}>{seg}</span>], count];
    },
    [[], 0] as [JSX.Element[], number]
  );

  return (
    <div className="p-4 flex-col flex rounded border-2 mb-4 ">
      <div className="font-semibold font-md mb-4">Example</div>
      <div className="p-2 rounded bg-washedGray font-mono">{segments}</div>
    </div>
  );
}

function Scry(props: { doc: ScryPath; path: string }) {
  const { doc, path } = props;
  const { parameters = {}, result } = doc;
  const [expand, setExpand] = useState(false);
  const onClick = () => {
    setExpand((e) => !e);
  };
  const resultColor = colors[Object.keys(parameters).length];

  return (
    <div className="mb-5">
      <div
        className="border-2 rounded flex flex-col mb-4 rounded p-4"
        onClick={onClick}
      >
        <div className="text-lg mb-4 font-semibold">{result?.summary}</div>
        <Path path={path} />
      </div>
      {expand ? (
        <div className="ml-4">
          <ExamplePath path={path} params={parameters} />
          {Object.keys(parameters).length > 0 ? (
            <div className="mb-4 rounded flex flex-col p-4 bg-washedGray">
              <div className="text-lg font-medium mb-4">Parameters</div>
              <div className="flex flex-col">
                {Object.keys(parameters).map((param, idx) => {
                  const { description, format, example } = parameters[param];
                  const color = colors[idx];

                  return (
                    <div
                      className="mb-2 grid max-w-md grid-cols-param"
                      key={param}
                    >
                      <div
                        className={`mr-2 p-2 rounded flex items-center justify-center font-mono bg-${color} bg-opacity-70 `}
                      >
                        {param}
                      </div>
                      <div className={`items-center flex`}>{description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {result ? (
            <div className="p-4 flex flex-col rounded bg-washedGray">
              <div className="font-lg font-semibold text-lg text-semibold mb-2">
                Result
              </div>
              <div className="flex items-center">
                <div
                  className={`py-2 px-4 rounded bg-${resultColor} font-mono mr-2`}
                >
                  %{result.mark}
                </div>
                <div>{result.description}</div>
              </div>
            </div>
          ) : null}
        </div>
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
        example: 'urbit-help',
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
            children: {},
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
            children: {},
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
    <div className="flex flex-col p-2">
      <Head>
        <title>Scries | Graph Store</title>
      </Head>
      <div className="mb-6">
        <div className="text-xl font-bold mb-2">Graph Store Scries</div>
        <div>
          This is documentation of the upcoming changes to graph-store&apos;s scry
          API
        </div>
      </div>
      {_.map(flattenScryDoc(scries), (scry, path) => (
        <Scry key={path} path={path} doc={scry} />
      ))}
    </div>
  );
}
