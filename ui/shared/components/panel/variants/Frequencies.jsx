import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Popup } from 'semantic-ui-react'

import { HorizontalSpacer } from '../../Spacers'
import { GENOME_VERSION_37, GENOME_VERSION_38 } from '../../../utils/constants'


const FreqValue = styled.span`
  color: black;
`

const FreqLink = ({ urls, value, variant, queryParams }) => {
  let { chrom, pos, genomeVersion } = variant
  if (!urls[genomeVersion] && urls[variant.liftedOverGenomeVersion]) {
    chrom = variant.liftedOverChrom
    pos = variant.liftedOverPos
    genomeVersion = variant.liftedOverGenomeVersion
  }

  const isRegion = parseFloat(value, 10) <= 0
  let coords
  if (isRegion) {
    const posInt = parseInt(pos, 10)
    coords = `${chrom}-${posInt - 100}-${posInt + 100}`
  } else {
    coords = `${chrom}-${pos}-${variant.ref}-${variant.alt}`
  }

  const queryString = (queryParams && queryParams[genomeVersion]) ? `?${queryParams[genomeVersion]}` : ''

  return (
    <a href={`http://${urls[genomeVersion]}/${isRegion ? 'region' : 'variant'}/${coords}${queryString}`} target="_blank">
      {value}
    </a>
  )
}

FreqLink.propTypes = {
  urls: PropTypes.object.isRequired,
  value: PropTypes.string,
  variant: PropTypes.object.isRequired,
  queryParams: PropTypes.string,
}

const FreqSummary = ({ field, fieldTitle, variant, urls, queryParams, showAC, precision = 2 }) => {
  const { populations = {}, chrom } = variant
  const population = populations[field] || {}
  if (population.af === null || population.af === undefined) {
    return null
  }
  const value = population.af > 0 ? population.af.toPrecision(precision) : '0.0'

  const popCountDetails = [{ popField: `${field}_hom`, title: 'Hom' }]
  if (chrom.endsWith('X')) {
    popCountDetails.push({ popField: `${field}_hemi`, title: 'Hemi' })
  }
  if (showAC) {
    popCountDetails.push({ popField: 'AC', denominatorField: 'AN' })
  }

  return (
    <div>
      {fieldTitle}<HorizontalSpacer width={5} />
      <FreqValue>
        <b>
          {urls ?
            <FreqLink
              urls={urls}
              queryParams={queryParams}
              value={value}
              variant={variant}
            /> : value
          }
        </b>
        {population.hom !== null && population.hom !== undefined &&
          <span><HorizontalSpacer width={5} />Hom={population.hom}</span>
        }
        {chrom.endsWith('X') && population.hemi !== null && population.hemi !== undefined &&
          <span><HorizontalSpacer width={5} />Hemi={population.hemi}</span>
        }
        {showAC && population.ac !== null && population.ac !== undefined &&
          <span><HorizontalSpacer width={5} />AC={population.ac} out of {population.an}</span>
        }
      </FreqValue>
    </div>
  )
}

FreqSummary.propTypes = {
  field: PropTypes.string.isRequired,
  variant: PropTypes.object.isRequired,
  precision: PropTypes.number,
  fieldTitle: PropTypes.string,
  urls: PropTypes.object,
  queryParams: PropTypes.object,
  showAC: PropTypes.bool,
}

const POPULATIONS = [
  { field: 'callset', fieldTitle: 'This Callset', showAC: true },
  { field: 'g1k', fieldTitle: '1kg WGS' },
  {
    field: 'exac',
    fieldTitle: 'ExAC',
    urls: { [GENOME_VERSION_37]: 'gnomad.broadinstitute.org' },
    queryParams: { [GENOME_VERSION_37]: 'dataset=exac' },
  },
  { field: 'gnomad_exomes', fieldTitle: 'gnomAD exomes', urls: { [GENOME_VERSION_37]: 'gnomad.broadinstitute.org' } },
  {
    field: 'gnomad_genomes',
    fieldTitle: 'gnomAD genomes',
    precision: 3,
    urls: { [GENOME_VERSION_37]: 'gnomad.broadinstitute.org', [GENOME_VERSION_38]: 'gnomad.broadinstitute.org' },
    queryParams: { [GENOME_VERSION_38]: 'dataset=gnomad_r3' },
  },
  {
    field: 'topmed',
    fieldTitle: 'TopMed',
    precision: 3,
    urls: {
      [GENOME_VERSION_37]: 'bravo.sph.umich.edu/freeze3a/hg19',
      [GENOME_VERSION_38]: 'bravo.sph.umich.edu/freeze5/hg38',
    },
  },
]

const Frequencies = ({ variant }) => {
  const { populations } = variant
  const freqContent = (
    <div>
      {POPULATIONS.map(pop =>
        <FreqSummary key={pop.field} variant={variant} {...pop} />,
      )}
    </div>
  )

  return (
    Object.values(populations || {}).some(pop => pop.ac) ?
      <Popup
        position="top center"
        flowing
        trigger={freqContent}
        header="Allele Counts"
        content={
          <div>
            {POPULATIONS.filter(pop => populations[pop.field].ac).map(pop =>
              <div key={pop.field}>{pop.fieldTitle}: {populations[pop.field].ac} out of {populations[pop.field].an}</div>,
            )}
          </div>
        }
      />
      : freqContent
  )
}

Frequencies.propTypes = {
  variant: PropTypes.object,
}

export default Frequencies
