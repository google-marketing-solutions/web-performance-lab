/**
 * @license Copyright 2023 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author demirj@google.com (Demir Jasarevic)
 */

import {onLCP, onFID, onCLS} from 'web-vitals';

function sendToDataLayer({name, delta, value, id}) {
    dataLayer.push({
      // Make sure to push an event key for the listener in GTM
      event: 'coreWebVitals',
      metricName: name,
      metricId: id,
      metricValue: value,
      metricDelta: delta
    });
  }
  
  onCLS(sendToDataLayer);
  onFID(sendToDataLayer);
  onLCP(sendToDataLayer);